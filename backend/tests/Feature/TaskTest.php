<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Client $client;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->client = Client::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_list_tasks(): void
    {
        Task::factory(3)->create(['user_id' => $this->user->id, 'client_id' => $this->client->id, 'deal_id' => null]);

        $response = $this->actingAs($this->user)->getJson('/api/tasks');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_create_task(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/tasks', [
            'title' => 'Call client',
            'description' => 'Discuss contract',
            'due_date' => '2026-04-15',
            'status' => 'todo',
            'client_id' => $this->client->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['title' => 'Call client']);
    }

    public function test_create_task_validation(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/tasks', [
            'title' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_show_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id, 'client_id' => $this->client->id, 'deal_id' => null]);

        $response = $this->actingAs($this->user)->getJson("/api/tasks/{$task->id}");

        $response->assertOk()
            ->assertJsonFragment(['title' => $task->title]);
    }

    public function test_update_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id, 'client_id' => $this->client->id, 'deal_id' => null]);

        $response = $this->actingAs($this->user)->putJson("/api/tasks/{$task->id}", [
            'title' => 'Updated Task',
            'status' => 'done',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['title' => 'Updated Task']);
    }

    public function test_delete_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id, 'client_id' => $this->client->id, 'deal_id' => null]);

        $response = $this->actingAs($this->user)->deleteJson("/api/tasks/{$task->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_cannot_access_other_users_task(): void
    {
        $otherUser = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $otherUser->id, 'client_id' => null, 'deal_id' => null]);

        $response = $this->actingAs($this->user)->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(403);
    }

    public function test_filter_tasks_by_status(): void
    {
        Task::factory()->create(['user_id' => $this->user->id, 'client_id' => null, 'deal_id' => null, 'status' => 'todo']);
        Task::factory()->create(['user_id' => $this->user->id, 'client_id' => null, 'deal_id' => null, 'status' => 'done']);

        $response = $this->actingAs($this->user)->getJson('/api/tasks?status=todo');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
