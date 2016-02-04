package com.adobe.ionicapp.profile.services;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.resource.ResourceResolver;

import java.io.InputStream;

/**
 * Manages profile Avatars.
 */
@Component
@Service
public interface AvatarManager {

    /**
     * Updates an existing avatar or creates a new one.
     * @param inputStream avatar's upload stream
     * @param mimeType file mime type
     * @param resourceResolver resource resolver created from the user's session
     * @param userProfilePath path to the user's profile, <code>/home/user/bob@email.com</code> for example
     */
    void saveAvatar(final InputStream inputStream, final String mimeType,
                    final ResourceResolver resourceResolver, final String userProfilePath);

    /**
     * Creates the folder structure and stores avatar for a profile without a avatar.
     * @param inputStream avatar's upload stream
     * @param mimeType file mime type
     * @param resourceResolver resource resolver created from the user's session
     * @param userProfilePath path to the user's profile, <code>/home/user/bob@email.com</code> for example
     */
    void createAvatarWithDirectories(final InputStream inputStream, final String mimeType,
                                     final ResourceResolver resourceResolver, final String userProfilePath);
}
