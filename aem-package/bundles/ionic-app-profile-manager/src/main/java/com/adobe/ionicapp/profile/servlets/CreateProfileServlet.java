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
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.Servlet;

@Component(immediate = true, metatype = true)
@Service(Servlet.class)
@Properties({
        @Property(name = "sling.servlet.resourceTypes", value = "sling/servlet/default"),
        @Property(name = "sling.servlet.methods", value = "POST"),
        @Property(name = "sling.servlet.selectors", value = "ionicapp.create"),
        @Property(name = "sling.servlet.extensions", value = "html")
})
public class CreateProfileServlet extends SlingAllMethodsServlet {

    private static final Logger LOG = LoggerFactory.getLogger(CreateProfileServlet.class);

    @Reference
    AccountManager accountManager;

    @Override
    public void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) {
        final String givenName = request.getParameter(ProfileConstants.PARAM_GIVEN_NAME);
        final String familyName = request.getParameter(ProfileConstants.PARAM_FAMILY_NAME);
        final String email = request.getParameter(ProfileConstants.PARAM_EMAIL);
        final String password = request.getParameter(ProfileConstants.PARAM_PASSWORD);
        final RequestParameter avatarParam = request.getRequestParameter(ProfileConstants.PARAM_AVATAR);

        Resource user = accountManager.createUser(email, password, givenName, familyName, email, avatarParam);

        if(user == null) {
            LOG.warn("User {} was not created.", email);
            return;
        } else {
            LOG.debug("User {} was created at {}", email, user.getPath());
        }
    }
}
