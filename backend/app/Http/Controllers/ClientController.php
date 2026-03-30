<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Http\Resources\ClientResource;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClientController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $clients = $request->user()->clients()
            ->withCount(['deals', 'tasks'])
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->search, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('company', 'ilike', "%{$search}%");
            }))
            ->latest()
            ->paginate(15);

        return ClientResource::collection($clients);
    }

    public function store(ClientRequest $request): ClientResource
    {
        $client = $request->user()->clients()->create($request->validated());

        return new ClientResource($client);
    }

    public function show(Request $request, Client $client): ClientResource
    {
        abort_unless($client->user_id === $request->user()->id, 403);

        $client->loadCount(['deals', 'tasks']);

        return new ClientResource($client);
    }

    public function update(ClientRequest $request, Client $client): ClientResource
    {
        abort_unless($client->user_id === $request->user()->id, 403);

        $client->update($request->validated());

        return new ClientResource($client);
    }

    public function destroy(Request $request, Client $client): JsonResponse
    {
        abort_unless($client->user_id === $request->user()->id, 403);

        $client->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
