package com.adobe.ionicapp.sly;

import com.adobe.cq.address.api.location.Location;
import com.adobe.cq.address.api.location.LocationManager;
import com.adobe.cq.sightly.WCMUse;
import com.day.cq.wcm.api.Page;

@SuppressWarnings("unused")
public class LocationHelper extends WCMUse {

    private Page page;
    private Location location;

    @Override
    public void activate() throws Exception {
        page = get("page", Page.class);
        LocationManager locMgr = getResourceResolver().adaptTo(LocationManager.class);
        location = locMgr.getLocation(page.getProperties().get("./location", String.class));
    }

    public String getTitle() {
        if (location != null) {
            return location.getTitle();
        } else {
            return "";
        }
    }

    public String getDescription() {
        if (location != null) {
            return location.getDescription();
        } else {
            return "";
        }
    }

    public String getAddress() {
        if (location != null) {
            return location.getFullAddress();
        } else {
            return "";
        }
    }

    public String getPhone() {
        if (location != null) {
            return location.getPhone();
        } else {
            return "";
        }
    }

    public Double getLatitude() {
        if (location.getCoordinates() != null)
            return location.getCoordinates().getLat();

        return null;
    }

    public Double getLongitude() {
        if (location.getCoordinates() != null)
            return location.getCoordinates().getLng();

        return null;
    }

}