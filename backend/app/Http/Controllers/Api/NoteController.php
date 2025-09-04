<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\NoteRequest;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $notes = Note::search($request->query('q'))
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => NoteResource::collection($notes->items()),
            'meta' => [
                'current_page' => $notes->currentPage(),
                'last_page' => $notes->lastPage(),
                'per_page' => $notes->perPage(),
                'total' => $notes->total(),
            ],
            'message' => null,
            'errors' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(NoteRequest $request): JsonResponse
    {
        $note = Note::create($request->validated());

        return response()->json([
            'data' => new NoteResource($note),
            'message' => 'Nota creada exitosamente.',
            'errors' => null,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Note $note): JsonResponse
    {
        return response()->json([
            'data' => new NoteResource($note),
            'message' => null,
            'errors' => null,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(NoteRequest $request, Note $note): JsonResponse
    {
        $note->update($request->validated());

        return response()->json([
            'data' => new NoteResource($note->fresh()),
            'message' => 'Nota actualizada exitosamente.',
            'errors' => null,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Note $note): JsonResponse
    {
        $note->delete();

        return response()->json([
            'data' => null,
            'message' => 'Nota eliminada exitosamente.',
            'errors' => null,
        ]);
    }
}