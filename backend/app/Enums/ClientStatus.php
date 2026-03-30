<?php

namespace App\Enums;

enum ClientStatus: string
{
    case Lead = 'lead';
    case Active = 'active';
    case Inactive = 'inactive';
}
