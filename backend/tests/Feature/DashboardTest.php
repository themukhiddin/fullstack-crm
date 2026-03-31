<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Deal;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_returns_stats(): void
    {
        $user = User::factory()->create();
        $client = Client::factory()->create(['user_id' => $user->id]);
        Deal::factory()->create(['user_id' => $user->id, 'client_id' => $client->id, 'stage' => 'won', 'amount' => 10000]);
        Task::factory()->create(['user_id' => $user->id, 'client_id' => null, 'deal_id' => null, 'status' => 'todo']);

        $response = $this->actingAs($user)->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonStructure([
                'clients_count',
                'deals_count',
                'deals_total',
                'deals_won',
                'tasks_todo',
                'tasks_in_progress',
                'recent_clients',
                'recent_deals',
            ]);
    }

    public function test_dashboard_requires_auth(): void
    {
        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(401);
    }
}
