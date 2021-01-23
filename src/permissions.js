module.exports = {
    isUserMember(user, config) {
        if (!user) return false;
        return user.roles.cache.find(role => role.id === config.roles.memberRoleID);
    }
}
