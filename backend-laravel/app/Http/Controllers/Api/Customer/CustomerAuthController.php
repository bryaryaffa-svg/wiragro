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

    public function checkResellerActivation(Request $request, CustomerAuthService $auth): JsonResponse
    {
        $data = $request->validate([
            'store_code' => ['nullable', 'string', 'max:50'],
            'username' => ['required', 'string', 'max:80'],
        ]);

        return response()->json(
            $auth->checkResellerActivation(
                $data['store_code'] ?? config('storefront.default_store_code', 'SIDO-JATIM-ONLINE'),
                (string) $data['username'],
            )
        );
    }

    public function setResellerPassword(Request $request, CustomerAuthService $auth): JsonResponse
    {
        $data = $request->validate([
            'store_code' => ['nullable', 'string', 'max:50'],
            'username' => ['required', 'string', 'max:80'],
            'password' => ['required', 'string', 'min:6', 'max:255'],
        ]);

        return response()->json(
            $auth->setResellerPassword(
                $data['store_code'] ?? config('storefront.default_store_code', 'SIDO-JATIM-ONLINE'),
                (string) $data['username'],
                (string) $data['password'],
            )
        );
    }

    public function loginReseller(Request $request, CustomerAuthService $auth): JsonResponse
    {
        $data = $request->validate([
            'store_code' => ['nullable', 'string', 'max:50'],
            'username' => ['required', 'string', 'max:80'],
            'password' => ['required', 'string', 'min:6', 'max:255'],
        ]);

        return response()->json(
            $auth->loginReseller(
                $data['store_code'] ?? config('storefront.default_store_code', 'SIDO-JATIM-ONLINE'),
                (string) $data['username'],
                (string) $data['password'],
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
