<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TestAuthController extends Controller
{
    public function test(Request $request)
    {
        \Log::info("TEST ENDPOINT: User is " . ($request->user() ? $request->user()->email : 'NONE'));

        return response()->json([
            'message' => 'Test endpoint',
            'user' => $request->user(),
            'auth' => $request->user() ? 'authenticated' : 'not authenticated',
        ]);
    }
}
