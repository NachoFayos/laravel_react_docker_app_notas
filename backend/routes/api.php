<?php

use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\NoteController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [HealthController::class, 'check']);

Route::apiResource('notes', NoteController::class);