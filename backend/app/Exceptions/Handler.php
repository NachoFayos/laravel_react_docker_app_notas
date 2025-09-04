<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e): Response
    {
        // Handle API requests
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    /**
     * Handle API exceptions and return JSON responses.
     */
    protected function handleApiException(Request $request, Throwable $e): JsonResponse
    {
        // Handle validation exceptions
        if ($e instanceof ValidationException) {
            return response()->json([
                'data' => null,
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $e->errors(),
            ], 422);
        }

        // Handle model not found exceptions
        if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'data' => null,
                'message' => 'El recurso solicitado no fue encontrado.',
                'errors' => ['resource' => ['Resource not found']],
            ], 404);
        }

        // Handle method not allowed exceptions
        if ($e instanceof \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException) {
            return response()->json([
                'data' => null,
                'message' => 'Método HTTP no permitido.',
                'errors' => ['method' => ['Method not allowed']],
            ], 405);
        }

        // Handle not found exceptions
        if ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
            return response()->json([
                'data' => null,
                'message' => 'Endpoint no encontrado.',
                'errors' => ['endpoint' => ['Endpoint not found']],
            ], 404);
        }

        // For other exceptions, return generic error in production
        if (config('app.debug')) {
            return response()->json([
                'data' => null,
                'message' => $e->getMessage(),
                'errors' => ['debug' => [$e->getTraceAsString()]],
            ], 500);
        }

        return response()->json([
            'data' => null,
            'message' => 'Ha ocurrido un error interno del servidor.',
            'errors' => ['server' => ['Internal server error']],
        ], 500);
    }
}