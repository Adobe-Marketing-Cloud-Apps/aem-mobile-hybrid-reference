package com.adobe.ionicapp.profile.services;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.request.RequestParameter;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;

/**
 * Manages user accounts and their profile.
 */
@Component
@Service
public interface AccountManager {
    /**
     * Creates a new user profile in the repository.
     * @param userName user's login name
     * @param password user's passward
     * @param givenName user's first name
     * @param lastName user's last name
     * @param email user's email
     * @param avatarParam user's avatar upload parameter. This parameter may be null.
     * @return the newly created profile resource, null if failed to create one.
     */
    Resource createUser(String userName, String password, String givenName, String lastName, String email, RequestParameter avatarParam);
    void changePassword(String newPassword, ResourceResolver resourceResolver);
}