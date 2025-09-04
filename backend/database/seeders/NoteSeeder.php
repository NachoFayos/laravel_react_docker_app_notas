<?php

namespace Database\Seeders;

use App\Models\Note;
use Illuminate\Database\Seeder;

class NoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Note::factory()->count(15)->create();
        
        // Create some specific test notes
        Note::create([
            'title' => 'Mi primera nota',
            'content' => 'Esta es una nota de prueba para verificar que el sistema funciona correctamente.',
        ]);
        
        Note::create([
            'title' => 'Lista de tareas',
            'content' => "- Completar la prueba técnica\n- Revisar el código\n- Hacer los tests\n- Crear el README",
        ]);
        
        Note::create([
            'title' => 'Recordatorio importante',
            'content' => null,
        ]);
    }
}