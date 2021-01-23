module.exports = {
    isUserMember(user, config) {
        return user.roles.cache.find(role => role.id === config.roles.memberRoleID);
    }
}
