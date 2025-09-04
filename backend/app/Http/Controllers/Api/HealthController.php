<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * Check application health.
     */
    public function check(): JsonResponse
    {
        try {
            DB::connection()->getPdo();
            
            return response()->json([
                'data' => [
                    'db' => 'ok'
                ],
                'message' => null,
                'errors' => null,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => [
                    'db' => 'error'
                ],
                'message' => 'Database connection failed',
                'errors' => ['database' => ['Connection failed: ' . $e->getMessage()]],
            ], 500);
        }
    }
}