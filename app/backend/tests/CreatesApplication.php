<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Application;

trait CreatesApplication
{
    /**
     * Creates the application.
     */
    public function createApplication(): Application
    {
        putenv('APP_ENV=testing');
        putenv('DB_CONNECTION=sqlite');
        putenv('DB_DATABASE=:memory:');
        putenv('APP_CONFIG_CACHE=' . sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'easycms-test-config.php');
        putenv('APP_EVENTS_CACHE=' . sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'easycms-test-events.php');
        putenv('APP_PACKAGES_CACHE=' . sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'easycms-test-packages.php');
        putenv('APP_ROUTES_CACHE=' . sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'easycms-test-routes.php');

        $_ENV['APP_ENV'] = 'testing';
        $_ENV['DB_CONNECTION'] = 'sqlite';
        $_ENV['DB_DATABASE'] = ':memory:';
        $_ENV['APP_CONFIG_CACHE'] = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'easycms-test-config.php';
        $_ENV['APP_EVENTS_CACHE'] = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'easycms-test-events.php';
        $_ENV['APP_PACKAGES_CACHE'] = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'easycms-test-packages.php';
        $_ENV['APP_ROUTES_CACHE'] = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'easycms-test-routes.php';

        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(Kernel::class)->bootstrap();

        $app['config']->set('app.env', 'testing');
        $app['config']->set('database.default', 'sqlite');
        $app['config']->set('database.connections.sqlite.database', ':memory:');

        return $app;
    }
}
