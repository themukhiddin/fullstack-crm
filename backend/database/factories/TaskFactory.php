<?php

namespace Database\Factories;

use App\Enums\TaskStatus;
use App\Models\Client;
use App\Models\Deal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'client_id' => fake()->optional(0.7)->passthrough(Client::factory()),
            'deal_id' => fake()->optional(0.4)->passthrough(Deal::factory()),
            'title' => fake()->sentence(3),
            'description' => fake()->optional(0.6)->paragraph(),
            'due_date' => fake()->optional(0.8)->dateTimeBetween('now', '+2 months'),
            'status' => fake()->randomElement(TaskStatus::cases()),
        ];
    }
}
