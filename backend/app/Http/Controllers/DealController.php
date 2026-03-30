<?php

namespace App\Http\Controllers;

use App\Http\Requests\DealRequest;
use App\Http\Resources\DealResource;
use App\Models\Deal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DealController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $deals = $request->user()->deals()
            ->with('client')
            ->withCount('tasks')
            ->when($request->stage, fn ($q, $stage) => $q->where('stage', $stage))
            ->latest()
            ->paginate(15);

        return DealResource::collection($deals);
    }

    public function store(DealRequest $request): DealResource
    {
        $deal = $request->user()->deals()->create($request->validated());
        $deal->load('client');

        return new DealResource($deal);
    }

    public function show(Request $request, Deal $deal): DealResource
    {
        abort_unless($deal->user_id === $request->user()->id, 403);

        $deal->load('client')->loadCount('tasks');

        return new DealResource($deal);
    }

    public function update(DealRequest $request, Deal $deal): DealResource
    {
        abort_unless($deal->user_id === $request->user()->id, 403);

        $deal->update($request->validated());
        $deal->load('client');

        return new DealResource($deal);
    }

    public function destroy(Request $request, Deal $deal): JsonResponse
    {
        abort_unless($deal->user_id === $request->user()->id, 403);

        $deal->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
