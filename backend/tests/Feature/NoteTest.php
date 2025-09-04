<?php

namespace Tests\Feature;

use App\Models\Note;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_notes(): void
    {
        Note::factory()->count(3)->create();

        $response = $this->getJson('/api/notes');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'content', 'created_at', 'updated_at']
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
                'message',
                'errors'
            ]);
    }

    public function test_can_create_note_with_valid_data(): void
    {
        $noteData = [
            'title' => 'Test Note',
            'content' => 'This is a test note content.'
        ];

        $response = $this->postJson('/api/notes', $noteData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'title' => 'Test Note',
                    'content' => 'This is a test note content.'
                ],
                'message' => 'Nota creada exitosamente.',
                'errors' => null
            ]);

        $this->assertDatabaseHas('notes', $noteData);
    }

    public function test_cannot_create_note_without_title(): void
    {
        $noteData = [
            'content' => 'This note has no title.'
        ];

        $response = $this->postJson('/api/notes', $noteData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_can_search_notes_by_title(): void
    {
        Note::factory()->create(['title' => 'Laravel Tutorial']);
        Note::factory()->create(['title' => 'React Guide']);
        Note::factory()->create(['title' => 'Vue.js Basics']);

        $response = $this->getJson('/api/notes?q=Laravel');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Laravel Tutorial', $data[0]['title']);
    }

    public function test_can_update_note(): void
    {
        $note = Note::factory()->create();
        
        $updateData = [
            'title' => 'Updated Title',
            'content' => 'Updated content'
        ];

        $response = $this->putJson("/api/notes/{$note->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => $updateData,
                'message' => 'Nota actualizada exitosamente.',
                'errors' => null
            ]);

        $this->assertDatabaseHas('notes', array_merge(['id' => $note->id], $updateData));
    }

    public function test_can_delete_note(): void
    {
        $note = Note::factory()->create();

        $response = $this->deleteJson("/api/notes/{$note->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => null,
                'message' => 'Nota eliminada exitosamente.',
                'errors' => null
            ]);

        $this->assertDatabaseMissing('notes', ['id' => $note->id]);
    }

    public function test_health_endpoint_returns_ok(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'data' => ['db' => 'ok'],
                'message' => null,
                'errors' => null
            ]);
    }
}