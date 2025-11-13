<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class)->in('Feature');
uses(Tests\TestCase::class)->in('Feature', 'Unit');
