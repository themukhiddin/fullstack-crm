<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $tasks = $request->user()->tasks()
            ->with(['client', 'deal'])
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->orderBy('due_date')
            ->paginate(15);

        return TaskResource::collection($tasks);
    }

    public function store(TaskRequest $request): TaskResource
    {
        $task = $request->user()->tasks()->create($request->validated());
        $task->load(['client', 'deal']);

        return new TaskResource($task);
    }

    public function show(Request $request, Task $task): TaskResource
    {
        abort_unless($task->user_id === $request->user()->id, 403);

        $task->load(['client', 'deal']);

        return new TaskResource($task);
    }

    public function update(TaskRequest $request, Task $task): TaskResource
    {
        abort_unless($task->user_id === $request->user()->id, 403);

        $task->update($request->validated());
        $task->load(['client', 'deal']);

        return new TaskResource($task);
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        abort_unless($task->user_id === $request->user()->id, 403);

        $task->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
