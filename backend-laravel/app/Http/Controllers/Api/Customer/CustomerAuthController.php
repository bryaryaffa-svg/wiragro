<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\GoogleLoginRequest;
use App\Http\Requests\Customer\WhatsAppOtpRequest;
use App\Http\Requests\Customer\WhatsAppOtpVerifyRequest;
use App\Models\Customer;
use App\Support\CustomerAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerAuthController extends Controller
{
    public function loginGoogle(GoogleLoginRequest $request, CustomerAuthService $auth): JsonResponse
    {
        $data = $request->validated();

        return response()->json(
            $auth->loginGoogle(
                $data['store_code'] ?? config('storefront.default_store_code', 'SIDO-JATIM-ONLINE'),
                (string) $data['id_token']
            )
        );
    }

    public function requestOtp(WhatsAppOtpRequest $request, CustomerAuthService $auth): JsonResponse
    {
        $data = $request->validated();

        return response()->json(
            $auth->requestOtp(
                $data['store_code'] ?? config('storefront.default_store_code', 'SIDO-JATIM-ONLINE'),
                (string) $data['phone']
            )
        );
    }

    public function verifyOtp(WhatsAppOtpVerifyRequest $request, CustomerAuthService $auth): JsonResponse
    {
        $data = $request->validated();

        return response()->json(
            $auth->verifyOtp(
                $data['store_code'] ?? config('storefront.default_store_code', 'SIDO-JATIM-ONLINE'),
                (string) $data['challenge_id'],
                (string) $data['otp_code']
            )
        );
    }

    public function logout(Request $request, CustomerAuthService $auth): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $token = (string) $request->bearerToken();
        $auth->logout($customer, $token);

        return response()->json([
            'status' => 'logged_out',
        ]);
    }
}
