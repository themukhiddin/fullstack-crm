<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $cacheKey = "dashboard:{$user->id}";

        $stats = Cache::remember($cacheKey, 60, function () use ($user) {
            return [
                'clients_count' => $user->clients()->count(),
                'deals_count' => $user->deals()->count(),
                'deals_total' => (float) $user->deals()->sum('amount'),
                'deals_won' => (float) $user->deals()->where('stage', 'won')->sum('amount'),
                'tasks_todo' => $user->tasks()->where('status', 'todo')->count(),
                'tasks_in_progress' => $user->tasks()->where('status', 'in_progress')->count(),
                'recent_clients' => $user->clients()->latest()->take(5)->get(['id', 'name', 'company', 'status', 'created_at'])->toArray(),
                'recent_deals' => $user->deals()->with('client:id,name')->latest()->take(5)->get(['id', 'title', 'amount', 'stage', 'client_id', 'created_at'])->toArray(),
            ];
        });

        return response()->json($stats);
    }
}
