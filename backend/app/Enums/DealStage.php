<?php

namespace App\Enums;

enum DealStage: string
{
    case New = 'new';
    case Negotiation = 'negotiation';
    case Won = 'won';
    case Lost = 'lost';
}
