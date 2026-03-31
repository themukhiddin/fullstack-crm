<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Deal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DealTest extends TestCase
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

    public function test_list_deals(): void
    {
        Deal::factory(3)->create(['user_id' => $this->user->id, 'client_id' => $this->client->id]);

        $response = $this->actingAs($this->user)->getJson('/api/deals');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_create_deal(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/deals', [
            'title' => 'Big Deal',
            'amount' => 50000,
            'stage' => 'new',
            'client_id' => $this->client->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['title' => 'Big Deal']);
    }

    public function test_create_deal_validation(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/deals', [
            'title' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'client_id']);
    }

    public function test_show_deal(): void
    {
        $deal = Deal::factory()->create(['user_id' => $this->user->id, 'client_id' => $this->client->id]);

        $response = $this->actingAs($this->user)->getJson("/api/deals/{$deal->id}");

        $response->assertOk()
            ->assertJsonFragment(['title' => $deal->title]);
    }

    public function test_update_deal(): void
    {
        $deal = Deal::factory()->create(['user_id' => $this->user->id, 'client_id' => $this->client->id]);

        $response = $this->actingAs($this->user)->putJson("/api/deals/{$deal->id}", [
            'title' => 'Updated Deal',
            'client_id' => $this->client->id,
        ]);

        $response->assertOk()
            ->assertJsonFragment(['title' => 'Updated Deal']);
    }

    public function test_delete_deal(): void
    {
        $deal = Deal::factory()->create(['user_id' => $this->user->id, 'client_id' => $this->client->id]);

        $response = $this->actingAs($this->user)->deleteJson("/api/deals/{$deal->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('deals', ['id' => $deal->id]);
    }

    public function test_cannot_access_other_users_deal(): void
    {
        $otherUser = User::factory()->create();
        $otherClient = Client::factory()->create(['user_id' => $otherUser->id]);
        $deal = Deal::factory()->create(['user_id' => $otherUser->id, 'client_id' => $otherClient->id]);

        $response = $this->actingAs($this->user)->getJson("/api/deals/{$deal->id}");

        $response->assertStatus(403);
    }

    public function test_filter_deals_by_stage(): void
    {
        Deal::factory()->create(['user_id' => $this->user->id, 'client_id' => $this->client->id, 'stage' => 'new']);
        Deal::factory()->create(['user_id' => $this->user->id, 'client_id' => $this->client->id, 'stage' => 'won']);

        $response = $this->actingAs($this->user)->getJson('/api/deals?stage=won');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
