<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class RajaOngkirService
{
    public function searchDestinations(string $search, int $limit = 8, int $offset = 0): array
    {
        $term = trim($search);
        if ($term === '') {
            return [];
        }

        $response = $this->client()->get('/destination/domestic-destination', [
            'search' => $term,
            'limit' => max(1, min($limit, 20)),
            'offset' => max(0, $offset),
        ]);

        if ($response->status() === 404) {
            return [];
        }

        $payload = $this->decodeResponse($response, 'Tujuan pengiriman belum bisa dicari.');
        $data = $payload['data'] ?? [];

        if (! is_array($data)) {
            return [];
        }

        return collect($data)
            ->filter(fn (mixed $item): bool => is_array($item))
            ->map(function (array $item): array {
                return [
                    'id' => (string) ($item['id'] ?? ''),
                    'label' => (string) ($item['label'] ?? ''),
                    'province_name' => $item['province_name'] ?? null,
                    'city_name' => $item['city_name'] ?? null,
                    'district_name' => $item['district_name'] ?? null,
                    'subdistrict_name' => $item['subdistrict_name'] ?? null,
                    'zip_code' => $item['zip_code'] ?? null,
                ];
            })
            ->filter(fn (array $item): bool => $item['id'] !== '' && $item['label'] !== '')
            ->values()
            ->all();
    }

    public function calculateDomesticCost(
        string $destinationId,
        int $weightGrams,
        ?string $courier = null,
    ): array {
        if ($weightGrams <= 0) {
            throw new UnprocessableEntityHttpException('Berat total pesanan belum valid untuk cek ongkir.');
        }

        $payload = [
            'origin' => $this->originId(),
            'destination' => $destinationId,
            'weight' => $weightGrams,
            'courier' => $this->resolveCourierString($courier),
            'price' => config('rajaongkir.price_mode', 'lowest'),
        ];

        $response = $this->client()
            ->asForm()
            ->post('/calculate/domestic-cost', $payload);

        if (in_array($response->status(), [400, 404], true)) {
            return [];
        }

        $decoded = $this->decodeResponse($response, 'Tarif pengiriman belum bisa dihitung.');
        $data = $decoded['data'] ?? [];

        if (! is_array($data)) {
            return [];
        }

        return collect($data)
            ->filter(fn (mixed $courierItem): bool => is_array($courierItem))
            ->flatMap(function (array $courierItem): array {
                $courierCode = Str::lower((string) ($courierItem['code'] ?? $courierItem['shipping_code'] ?? ''));
                $courierName = (string) ($courierItem['name'] ?? $courierItem['shipping_name'] ?? Str::upper($courierCode));
                $services = $courierItem['costs'] ?? $courierItem['cost'] ?? [];

                if (! is_array($services)) {
                    return [];
                }

                return collect($services)
                    ->filter(fn (mixed $service): bool => is_array($service))
                    ->map(function (array $service) use ($courierCode, $courierName): array {
                        $serviceCode = (string) ($service['service'] ?? $service['service_code'] ?? '');
                        $serviceName = (string) ($service['description'] ?? $service['service_name'] ?? $serviceCode);
                        $serviceCost = $service['cost'] ?? null;
                        $serviceCosts = $service['costs'] ?? null;
                        $rawCost = is_array($serviceCost) && array_is_list($serviceCost)
                            ? ($serviceCost[0] ?? $service)
                            : (is_array($serviceCosts) && array_is_list($serviceCosts)
                                ? ($serviceCosts[0] ?? $service)
                                : $service);
                        $amount = $rawCost['value']
                            ?? $rawCost['cost']
                            ?? $rawCost['shipping_cost']
                            ?? $service['value']
                            ?? $service['cost']
                            ?? $service['shipping_cost']
                            ?? 0;
                        $etd = $rawCost['etd']
                            ?? $service['etd']
                            ?? null;

                        return [
                            'id' => sprintf('%s:%s', $courierCode, Str::upper($serviceCode)),
                            'courier_code' => $courierCode,
                            'courier_name' => $courierName,
                            'service_code' => Str::upper($serviceCode),
                            'service_name' => $serviceName,
                            'description' => $service['description'] ?? null,
                            'cost' => number_format((float) $amount, 2, '.', ''),
                            'etd' => $etd !== null ? trim((string) $etd) : null,
                        ];
                    })
                    ->filter(fn (array $service): bool => $service['courier_code'] !== '' && $service['service_code'] !== '')
                    ->values()
                    ->all();
            })
            ->values()
            ->all();
    }

    private function client()
    {
        $this->ensureConfigured();

        return Http::baseUrl(config('rajaongkir.base_url'))
            ->timeout(max(5, (int) config('rajaongkir.timeout_seconds', 15)))
            ->acceptJson()
            ->withHeaders([
                'key' => config('rajaongkir.api_key'),
            ]);
    }

    private function decodeResponse($response, string $fallbackMessage): array
    {
        if ($response->successful()) {
            return $response->json() ?? [];
        }

        $payload = $response->json();
        $message = is_array($payload)
            ? (string) data_get($payload, 'meta.message', $fallbackMessage)
            : $fallbackMessage;

        if ($response->status() === 422) {
            throw new UnprocessableEntityHttpException($message !== '' ? $message : $fallbackMessage);
        }

        throw new HttpException(
            $response->status() >= 500 ? 503 : $response->status(),
            $message !== '' ? $message : $fallbackMessage
        );
    }

    private function ensureConfigured(): void
    {
        if ($this->originId() === '' || (string) config('rajaongkir.api_key') === '') {
            throw new HttpException(503, 'Integrasi ongkir RajaOngkir belum dikonfigurasi.');
        }
    }

    private function originId(): string
    {
        return trim((string) config('rajaongkir.origin_id'));
    }

    private function resolveCourierString(?string $courier = null): string
    {
        $courier = $courier ? Str::lower(trim($courier)) : null;
        $configured = config('rajaongkir.couriers', []);
        $couriers = $courier ? [$courier] : (is_array($configured) ? $configured : []);
        $couriers = array_values(array_filter(array_map(
            static fn (string $value): string => Str::lower(trim($value)),
            $couriers
        )));

        if ($couriers === []) {
            throw new HttpException(503, 'Daftar kurir RajaOngkir belum dikonfigurasi.');
        }

        return implode(':', $couriers);
    }
}
