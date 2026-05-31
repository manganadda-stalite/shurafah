<?php

it('exposes the /up health check endpoint', function () {
    $this->get('/up')->assertOk();
});

it('serves the application root', function () {
    $this->get('/')->assertOk();
});
