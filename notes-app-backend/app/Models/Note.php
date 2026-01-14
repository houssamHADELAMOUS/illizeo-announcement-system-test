<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Note extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'title',
        'content',
        "tenant_id"
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForCurrentTenant($query)
    {
        return $query->where('tenant_id', tenancy()->tenant->id);
    }
}
