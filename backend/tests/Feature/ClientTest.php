<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_list_clients(): void
    {
        Client::factory(3)->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)->getJson('/api/clients');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_create_client(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/clients', [
            'name' => 'Acme Corp',
            'email' => 'acme@example.com',
            'phone' => '+7 900 123 45 67',
            'company' => 'Acme',
            'status' => 'lead',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Acme Corp']);
    }

    public function test_create_client_validation(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/clients', [
            'name' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_show_client(): void
    {
        $client = Client::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)->getJson("/api/clients/{$client->id}");

        $response->assertOk()
            ->assertJsonFragment(['name' => $client->name]);
    }

    public function test_update_client(): void
    {
        $client = Client::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)->putJson("/api/clients/{$client->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['name' => 'Updated Name']);
    }

    public function test_delete_client(): void
    {
        $client = Client::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)->deleteJson("/api/clients/{$client->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('clients', ['id' => $client->id]);
    }

    public function test_cannot_access_other_users_client(): void
    {
        $otherUser = User::factory()->create();
        $client = Client::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($this->user)->getJson("/api/clients/{$client->id}");

        $response->assertStatus(403);
    }

    public function test_search_clients(): void
    {
        Client::factory()->create(['user_id' => $this->user->id, 'name' => 'Alpha Corp']);
        Client::factory()->create(['user_id' => $this->user->id, 'name' => 'Beta Inc']);

        $response = $this->actingAs($this->user)->getJson('/api/clients?search=Alpha');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_filter_clients_by_status(): void
    {
        Client::factory()->create(['user_id' => $this->user->id, 'status' => 'lead']);
        Client::factory()->create(['user_id' => $this->user->id, 'status' => 'active']);

        $response = $this->actingAs($this->user)->getJson('/api/clients?status=lead');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
