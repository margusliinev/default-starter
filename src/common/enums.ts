enum Environment {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
    TEST = 'test',
}

enum Provider {
    CREDENTIALS = 'credentials',
    GITHUB = 'github',
    GOOGLE = 'google',
}

enum OpenApiTag {
    AUTH = 'Auth',
    USERS = 'Users',
}

export { Environment, Provider, OpenApiTag };
