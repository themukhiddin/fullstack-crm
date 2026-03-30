<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Deal;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => Hash::make('password'),
        ]);

        $clients = Client::factory(20)->create(['user_id' => $user->id]);

        $clients->each(function ($client) use ($user) {
            Deal::factory(rand(1, 3))->create([
                'user_id' => $user->id,
                'client_id' => $client->id,
            ]);
        });

        $deals = $user->deals;

        Task::factory(40)->create([
            'user_id' => $user->id,
            'client_id' => fn () => $clients->random()->id,
            'deal_id' => fn () => fake()->optional(0.4)->passthrough($deals->random()->id),
        ]);
    }
}
