/* eslint-disable */
export default async () => {
    const t = {
        ['./common/enums/provider.js']: await import('./common/enums/provider.js'),
        ['./features/users/entities/user.entity.js']: await import('./features/users/entities/user.entity.js'),
    };
    return {
        '@nestjs/swagger': {
            models: [
                [
                    import('./features/users/entities/user.entity.js'),
                    {
                        User: {
                            id: { required: true, type: () => String },
                            name: { required: true, type: () => String },
                            email: { required: true, type: () => String },
                            image: { required: true, type: () => String, nullable: true },
                            email_verified_at: { required: true, type: () => Date, nullable: true },
                            created_at: { required: true, type: () => Date },
                            updated_at: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import('./features/accounts/entities/account.entity.js'),
                    {
                        Account: {
                            id: { required: true, type: () => String },
                            user_id: { required: true, type: () => String },
                            provider: { required: true, enum: t['./common/enums/provider.js'].Provider },
                            provider_id: { required: true, type: () => String, nullable: true },
                            password: { required: true, type: () => String, nullable: true },
                            created_at: { required: true, type: () => Date },
                            updated_at: { required: true, type: () => Date },
                            user: { required: true, type: () => t['./features/users/entities/user.entity.js'].User },
                        },
                    },
                ],
                [
                    import('./features/sessions/entities/session.entity.js'),
                    {
                        Session: {
                            id: { required: true, type: () => String },
                            user_id: { required: true, type: () => String },
                            token: { required: true, type: () => String },
                            expires_at: { required: true, type: () => Date },
                            created_at: { required: true, type: () => Date },
                            updated_at: { required: true, type: () => Date },
                            user: { required: true, type: () => t['./features/users/entities/user.entity.js'].User },
                        },
                    },
                ],
                [
                    import('./features/users/dto/update-user.dto.js'),
                    {
                        UpdateUserDto: {
                            name: { required: false, type: () => String, minLength: 2, maxLength: 255 },
                            image: { required: false, type: () => String },
                        },
                    },
                ],
                [
                    import('./features/users/dto/create-user.dto.js'),
                    {
                        CreateUserDto: {
                            name: { required: true, type: () => String, minLength: 2, maxLength: 255 },
                            email: { required: true, type: () => String, format: 'email' },
                            image: { required: false, type: () => String, nullable: true },
                            email_verified_at: { required: false, type: () => Date, nullable: true },
                        },
                    },
                ],
                [
                    import('./features/auth/dto/register.dto.js'),
                    {
                        RegisterDto: {
                            name: { required: true, type: () => String, minLength: 2, maxLength: 255 },
                            email: { required: true, type: () => String, format: 'email' },
                            password: { required: true, type: () => String, minLength: 8, maxLength: 255, pattern: '/.*[A-Za-z].*/' },
                        },
                    },
                ],
                [
                    import('./features/auth/dto/login.dto.js'),
                    {
                        LoginDto: {
                            email: { required: true, type: () => String, format: 'email' },
                            password: { required: true, type: () => String },
                        },
                    },
                ],
            ],
            controllers: [
                [import('./features/health/health.controller.js'), { HealthController: { check: { type: String } } }],
                [
                    import('./features/users/users.controller.js'),
                    {
                        UsersController: {
                            me: { type: t['./features/users/entities/user.entity.js'].User },
                            update: { type: Object },
                            remove: {},
                        },
                    },
                ],
                [
                    import('./features/auth/auth.controller.js'),
                    {
                        AuthController: {
                            register: { type: String },
                            login: { type: String },
                            logout: { type: String },
                            logoutAll: { type: String },
                            googleAuth: {},
                            githubAuth: {},
                            googleCallback: {},
                            githubCallback: {},
                        },
                    },
                ],
            ],
        },
    };
};
