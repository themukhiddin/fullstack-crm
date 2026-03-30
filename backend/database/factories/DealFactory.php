<?php

namespace Database\Factories;

use App\Enums\DealStage;
use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DealFactory extends Factory
{
    public function definition(): array
    {
        $stage = fake()->randomElement(DealStage::cases());

        return [
            'user_id' => User::factory(),
            'client_id' => Client::factory(),
            'title' => fake()->bs(),
            'amount' => fake()->randomFloat(2, 1000, 500000),
            'stage' => $stage,
            'closed_at' => in_array($stage, [DealStage::Won, DealStage::Lost])
                ? fake()->dateTimeBetween('-3 months')
                : null,
        ];
    }
}
