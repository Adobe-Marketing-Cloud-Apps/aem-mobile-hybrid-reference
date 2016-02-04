package com.adobe.ionicapp.profile.servlets;

import com.adobe.ionicapp.profile.ProfileConstants;
import com.adobe.ionicapp.profile.services.AccountManager;
import com.adobe.ionicapp.profile.services.AvatarManager;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Properties;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.request.RequestParameter;
import org.apache.sling.api.resource.ModifiableValueMap;
import org.apache.sling.api.resource.PersistenceException;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.Servlet;
import java.io.*;

@Component(immediate = true, metatype = true)
@Service(Servlet.class)
@Properties({
        @Property(name = "sling.servlet.resourceTypes", value = "sling/servlet/default"),
        @Property(name = "sling.servlet.methods", value = "POST"),
        @Property(name = "sling.servlet.selectors", value = "ionicapp.profile"),
        @Property(name = "sling.servlet.extensions", value = "html")
})
public class UpdateProfileServlet extends SlingAllMethodsServlet {

    private static final Logger LOG = LoggerFactory.getLogger(UpdateProfileServlet.class);

    @Reference
    AccountManager accountManager;

    @Reference
    AvatarManager avatarManager;

    @Override
    public void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) {
        final ResourceResolver resourceResolver = request.getResource().getResourceResolver();
        final String profilePath = request.getParameter(ProfileConstants.PARAM_USER_PROFILE_PATH);
        final String givenName = request.getParameter(ProfileConstants.PARAM_GIVEN_NAME);
        final String familyName = request.getParameter(ProfileConstants.PARAM_FAMILY_NAME);
        final String email = request.getParameter(ProfileConstants.PARAM_EMAIL);

        LOG.debug("Updating user at {}", profilePath);

        final Resource profileResource = resourceResolver.resolve(profilePath);

        if(profileResource == null) {
            LOG.warn("Could not find user profile at path {}", profilePath);
            return;
        }

        // Profile Details
        final ModifiableValueMap valueMap = profileResource.adaptTo(ModifiableValueMap.class);
        valueMap.put(ProfileConstants.PROP_GIVEN_NAME, givenName);
        valueMap.put(ProfileConstants.PROP_FAMILY_NAME, familyName);
        valueMap.put(ProfileConstants.PROP_EMAIL, email);

        // Password
        final String password = request.getParameter(ProfileConstants.PARAM_PASSWORD);
        if(password != null && password.length() > 0) {
            accountManager.changePassword(password, resourceResolver);
        }

        // Avatar
        final RequestParameter avatarParam = request.getRequestParameter(ProfileConstants.PARAM_AVATAR);
        if(avatarParam != null && avatarParam.getSize() > 0) {
            final String mimeType  = avatarParam.getContentType();
            final InputStream inputStream = new ByteArrayInputStream(avatarParam.get());
            avatarManager.saveAvatar(inputStream, mimeType, resourceResolver, profilePath);
        } else {
            LOG.debug("User did not upload an avatar.");
        }


        try {
            resourceResolver.commit();
        } catch (PersistenceException e) {
            LOG.error("Could not commit changes to JCR, {}", e);
        }
    }
}
