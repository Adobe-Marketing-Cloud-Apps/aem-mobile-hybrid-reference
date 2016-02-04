package com.adobe.ionicapp.profile.services.impl;

import com.adobe.ionicapp.profile.services.AccountManager;
import com.adobe.ionicapp.profile.ProfileConstants;
import com.adobe.ionicapp.profile.services.AvatarManager;
import com.day.cq.commons.jcr.JcrConstants;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.apache.jackrabbit.api.security.user.User;
import org.apache.jackrabbit.api.security.user.UserManager;
import org.apache.sling.api.request.RequestParameter;
import org.apache.sling.api.resource.LoginException;
import org.apache.sling.api.resource.PersistenceException;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceResolverFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Component(metatype = false, immediate = true)
@Service(AccountManager.class)
public class AccountManagerImpl implements AccountManager {

    private static final Logger LOG = LoggerFactory.getLogger(AccountManagerImpl.class);
    private static final String IONIC_APP_PROFILE_SERVICE_USER = "ionic-app-profile-service";
    private static final String PROFILE_RESOURCE_NAME = "profile";
    private static final String PROFILE_RESOURCE_TYPE = "cq/security/components/profile";
    private static final String SLING_RESOURCE_TYPE = "sling:resourceType";

    @Reference
    AvatarManager avatarManager;

    @Reference
    private ResourceResolverFactory resourceResolverFactory;

    public Resource createUser(final String userName, final String password, final String givenName,
                               final String lastName, final String email, final RequestParameter avatarParam) {
        LOG.debug("Creating new account for user {}", userName);
        final Map<String, Object> authInfo = new HashMap<String, Object>();
        authInfo.put(ResourceResolverFactory.SUBSERVICE, IONIC_APP_PROFILE_SERVICE_USER);
        ResourceResolver resourceResolver = null;
        try {
            // create a new resource for the user
            resourceResolver = resourceResolverFactory.getServiceResourceResolver(authInfo);
            final UserManager userManager = resourceResolver.adaptTo(UserManager.class);
            final User user = userManager.createUser(userName, password);
            String path = user.getPath();

            // Apply user data to the resource
            Map<String, Object> map = new HashMap<String, Object>();
            map.put(ProfileConstants.PROP_GIVEN_NAME, givenName);
            map.put(ProfileConstants.PROP_FAMILY_NAME, lastName);
            map.put(ProfileConstants.PROP_EMAIL, email);
            map.put(JcrConstants.JCR_PRIMARYTYPE, JcrConstants.NT_UNSTRUCTURED);
            map.put(SLING_RESOURCE_TYPE, PROFILE_RESOURCE_TYPE);
            Resource resource = resourceResolver.getResource(path);
            resourceResolver.create(resource,PROFILE_RESOURCE_NAME, map);
            //commit
            resourceResolver.commit();

            // Avatar
            if(avatarParam != null && avatarParam.getSize() > 0) {
                final String mimeType  = avatarParam.getContentType();
                final InputStream inputStream = new ByteArrayInputStream(avatarParam.get());
                final String profilePath = user.getPath() + '/' + PROFILE_RESOURCE_NAME;
                avatarManager.createAvatarWithDirectories(inputStream, mimeType, resourceResolver, profilePath);
                resourceResolver.commit();
            } else {
                LOG.debug("User did not upload an avatar.");
            }

            LOG.debug("Successfully created user at path {}", path);
            return resource;
        } catch (RepositoryException e) {
            LOG.error("Failed to create new user {}", userName, e);
        } catch (LoginException e) {
            LOG.error("Could not authenticate the service", e);
        } catch (PersistenceException e) {
            LOG.error("Failed to persist new user {}", userName, e);
        } finally {
            if(resourceResolver != null) {
                resourceResolver.close();
            }
        }
        return null;
    }

    public void changePassword(final String newPassword, final ResourceResolver resourceResolver) {
        LOG.debug("Updating password for user {}", resourceResolver.getUserID());
        User user = resourceResolver.adaptTo(User.class);
        try {
            user.changePassword(newPassword);
        } catch (RepositoryException e) {
            LOG.error("Could not change password for user {}", resourceResolver.getUserID(), e);
        }
    }
}