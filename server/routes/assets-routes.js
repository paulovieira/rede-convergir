var routeTable = [

    // STATIC ASSETS - the handler is given here directly (unlike the handlers for the base routes)
    {
        method: 'GET',
        path: '/common/{anyPath*}',
        handler: {
            directory: { path: './client/common' }
        },
        config: {
            auth: false,
        }
    },

    {
        method: 'GET',
        path: '/uploads/{anyPath*}',
        handler: {
            directory: { path: './data/uploads' }
        },
        config: {
            auth: false,
        }
    },

    {
        method: 'GET',
        path: '/dashboard/{anyPath*}',
        handler: {
            directory: { path: './client/dashboard' }
        },
        config: {
            auth: false,
        }
    },

    {
        method: 'GET',
        path: '/dashboard2/{anyPath*}',
        handler: {
            directory: { path: './client/dashboard2' }
        },
        config: {
            auth: false,
        }
    },

    {
        method: 'GET',
        path: '/dashboard3/{anyPath*}',
        handler: {
            directory: { path: './client/dashboard3' }
        },
        config: {
            auth: false,
        }
    },

    {
        method: 'GET',
        path: '/ferramenta/{anyPath*}',
        handler: {
            directory: { path: './client/ferramenta' }
        },
        config: {
            auth: false,
        }
    },

    {
        method: 'GET',
        path: '/editor/{anyPath*}',
        handler: {
            directory: { path: './client/editor' }
        },
        config: {
            auth: false,
        }
    },

    {
        method: 'GET',
        path: '/mapa/{anyPath*}',
        handler: {
            directory: { path: './client/mapa' }
        },
        config: {
            auth: false,
        }
    },
];

module.exports = routeTable;