/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./users/dto/create-user.dto"), { "CreateUserDto": { username: { required: true, type: () => String }, email: { required: true, type: () => String }, password: { required: true, type: () => String } } }], [import("./users/dto/update-user.dto"), { "UpdateUserDto": { username: { required: true, type: () => String }, email: { required: true, type: () => String } } }]], "controllers": [[import("./app.controller"), { "AppController": { "healthCheck": {} } }], [import("./users/users.controller"), { "UsersController": { "create": {}, "findAll": {}, "findOne": {}, "update": {}, "remove": {} } }]] } };
};