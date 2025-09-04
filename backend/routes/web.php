<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['message' => 'Notes API is running'];
});

// Catch all routes for SPA
Route::fallback(function () {
    return response()->json(['message' => 'Route not found'], 404);
});