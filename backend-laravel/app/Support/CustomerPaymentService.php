<?php

namespace App\Support;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CustomerPaymentService
{
    public function createDuitkuPayment(
        Order $order,
        string $callbackUrl,
        string $returnUrl,
        ?Customer $customer = null,
        ?string $customerPhone = null,
    ): array
    {
        if ($customer && $order->customer_id !== $customer->id) {
            throw new NotFoundHttpException('Order tidak ditemukan untuk akun ini.');
        }

        if (! $customer) {
            if (! $customerPhone) {
                throw new UnprocessableEntityHttpException('Nomor customer wajib diisi untuk membuat pembayaran guest.');
            }

            if ($this->normalizePhone($customerPhone) !== $this->normalizePhone((string) $order->customer_phone)) {
                throw new NotFoundHttpException('Order tidak ditemukan untuk nomor customer ini.');
            }
        }

        if (strcasecmp((string) $order->payment_method, 'duitku-va') !== 0) {
            throw new UnprocessableEntityHttpException('Order ini tidak memakai pembayaran Duitku.');
        }

        if (! in_array((string) $order->payment_status, ['PENDING', 'UNPAID'], true)) {
            throw new UnprocessableEntityHttpException('Order tidak lagi menunggu pembayaran.');
        }

        $payment = Payment::query()->firstOrCreate(
            ['order_id' => $order->id, 'status' => 'PENDING'],
            [
                'customer_id' => $order->customer_id,
                'payment_reference' => $this->generateReference(),
                'gateway_code' => 'duitku',
                'method_code' => 'duitku-va',
                'amount' => $order->grand_total,
                'expires_at' => $order->auto_cancel_at,
            ]
        );

        $payload = [
            'merchant_code' => config('customer.duitku_merchant_code', 'DUMMYMERCHANT'),
            'reference' => $payment->payment_reference,
            'order_number' => $order->order_number,
            'amount' => number_format((float) $order->grand_total, 2, '.', ''),
            'callback_url' => $callbackUrl,
            'return_url' => $returnUrl,
        ];

        $payment->forceFill([
            'settlement_payload' => $payload,
        ])->save();

        return [
            'reference' => $payment->payment_reference,
            'payment_url' => rtrim((string) config('customer.duitku_sandbox_payment_url'), '?').'?ref='.$payment->payment_reference,
            'expiry' => optional($order->auto_cancel_at)->toIso8601String(),
            'request_payload' => $payload,
            'mode' => config('customer.duitku_payment_mode', 'server-stub-until-merchant-credentials-enabled'),
            'merchant_code' => config('customer.duitku_merchant_code', 'DUMMYMERCHANT'),
        ];
    }

    public function applyDuitkuCallback(array $payload): array
    {
        $reference = (string) ($payload['reference'] ?? $payload['merchantOrderId'] ?? $payload['merchant_order_id'] ?? '');

        if ($reference === '') {
            throw new UnprocessableEntityHttpException('Reference pembayaran tidak ditemukan.');
        }

        $payment = Payment::query()->where('payment_reference', $reference)->first();

        if (! $payment) {
            throw new NotFoundHttpException('Pembayaran tidak ditemukan.');
        }

        $status = Str::upper((string) ($payload['status'] ?? $payload['resultCode'] ?? 'PAID'));
        $normalizedStatus = in_array($status, ['PAID', 'SUCCESS'], true) ? 'PAID' : 'FAILED';

        $payment->forceFill([
            'status' => $normalizedStatus,
            'callback_payload' => $payload,
            'paid_at' => $normalizedStatus === 'PAID' ? now() : null,
        ])->save();

        $order = $payment->order;
        if ($order) {
            $order->forceFill([
                'payment_status' => $normalizedStatus,
                'status' => $normalizedStatus === 'PAID' ? 'DIPROSES' : $order->status,
            ])->save();
        }

        return [
            'status' => 'ok',
            'payment_reference' => $payment->payment_reference,
            'payment_status' => $payment->status,
        ];
    }

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if ($digits === '') {
            return $phone;
        }

        if (Str::startsWith($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        }

        if (! Str::startsWith($digits, '62')) {
            $digits = '62'.$digits;
        }

        return '+'.$digits;
    }

    private function generateReference(): string
    {
        do {
            $reference = 'DTP-'.now()->format('YmdHis').'-'.Str::upper(Str::random(6));
        } while (Payment::query()->where('payment_reference', $reference)->exists());

        return $reference;
    }
}
