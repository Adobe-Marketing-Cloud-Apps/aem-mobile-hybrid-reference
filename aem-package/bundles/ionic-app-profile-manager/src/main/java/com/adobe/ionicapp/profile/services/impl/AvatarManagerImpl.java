package com.adobe.ionicapp.profile.services.impl;

import com.adobe.ionicapp.profile.services.AvatarManager;
import com.day.cq.commons.jcr.JcrConstants;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.resource.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;

@Component(metatype = false, immediate = true)
@Service(AvatarManager.class)
public class AvatarManagerImpl implements AvatarManager {

    private static final String AVATAR_BIN_NAME = "image";
    private static final String AVATAR_RELATIVE_DIR = "/photos/primary";
    private static final String AVATAR_RELATIVE_RESOURCE = AVATAR_RELATIVE_DIR + '/' +
            AVATAR_BIN_NAME + '/' +JcrConstants.JCR_CONTENT;

    private static final String SLING_FOLDER = "sling:Folder";

    private static final Logger LOG = LoggerFactory.getLogger(AvatarManagerImpl.class);


    public void saveAvatar(final InputStream inputStream, final String mimeType, final ResourceResolver resourceResolver, final String userProfilePath) {
        Resource avatarResource = resourceResolver.getResource(userProfilePath + AVATAR_RELATIVE_RESOURCE);

        // check whether the profile already has an avatar
        if( avatarResource == null) {
            createAvatarWithDirectories(inputStream, mimeType, resourceResolver, userProfilePath);
            return;
        }

        final ModifiableValueMap valueMap = avatarResource.adaptTo(ModifiableValueMap.class);
        valueMap.put(JcrConstants.JCR_MIMETYPE, mimeType);

        final GregorianCalendar today = new GregorianCalendar();
        valueMap.put(JcrConstants.JCR_LASTMODIFIED, today);

        valueMap.put(JcrConstants.JCR_DATA, inputStream);

        try {
            resourceResolver.commit();
        } catch (PersistenceException persExcep) {
            LOG.error("Failed to create avatar binary node in JCR {}", AVATAR_RELATIVE_RESOURCE, persExcep);
        }
    }

    public void createAvatarWithDirectories(final InputStream inputStream, final String mimeType,
                                             final ResourceResolver resourceResolver, final String userProfilePath) {
        // create the directory structure
        final String[] directoryNames = AVATAR_RELATIVE_DIR.split("/");
        final GregorianCalendar today = new GregorianCalendar();
        Map<String, Object> prop = new HashMap<String, Object>();
        prop.put(JcrConstants.JCR_PRIMARYTYPE, SLING_FOLDER);
        prop.put(JcrConstants.JCR_CREATED, today);
        Resource tmp = resourceResolver.getResource(userProfilePath);
        try {
            for (final String name : directoryNames) {
                if (name.length() < 1) {
                    continue;
                }

                if (tmp.getChild(name) == null) {
                    tmp = resourceResolver.create(tmp, name, prop);
                }
            }

            // create the image node
            prop = new HashMap<String, Object>();
            prop.put(JcrConstants.JCR_PRIMARYTYPE, JcrConstants.NT_FILE);
            prop.put(JcrConstants.JCR_CREATED, today);
            tmp = resourceResolver.create(tmp, AVATAR_BIN_NAME, prop);

            // create the binary resource node
            prop = new HashMap<String, Object>();
            prop.put(JcrConstants.JCR_PRIMARYTYPE, JcrConstants.NT_RESOURCE);
            prop.put(JcrConstants.JCR_MIMETYPE, mimeType);
            prop.put(JcrConstants.JCR_DATA, inputStream);
            prop.put(JcrConstants.JCR_LASTMODIFIED, today);
            prop.put(JcrConstants.JCR_CREATED, today);

            resourceResolver.create(tmp, JcrConstants.JCR_CONTENT, prop);

            resourceResolver.commit();
        } catch (PersistenceException persExcep) {
            LOG.error("Failed to create avatar resource and parent directories under {}", userProfilePath, persExcep);
        }
    }
}
