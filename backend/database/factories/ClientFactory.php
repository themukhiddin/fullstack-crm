<?php

namespace Database\Factories;

use App\Enums\ClientStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'company' => fake()->company(),
            'status' => fake()->randomElement(ClientStatus::cases()),
            'notes' => fake()->optional(0.5)->sentence(),
        ];
    }
}
