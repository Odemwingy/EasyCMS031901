<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'log_type',
        'operator_id',
        'operator_name',
        'action',
        'object_type',
        'object_id',
        'object_name',
        'before_value',
        'after_value',
        'result',
        'fail_reason',
        'source_page',
        'request_id',
        'project_id',
        'ip_address',
    ];

    protected $casts = [
        'before_value' => 'array',
        'after_value' => 'array',
        'result' => 'integer',
    ];
}
