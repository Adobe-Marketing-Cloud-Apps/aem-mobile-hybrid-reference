package com.adobe.ionicapp.sly;

import com.adobe.cq.sightly.WCMUse;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.foundation.Image;
import org.apache.sling.api.resource.Resource;

@SuppressWarnings("unused")
public class NewsHelper extends WCMUse {

    private Page page;

    @Override
    public void activate() throws Exception {
        page = get("page", Page.class);
    }

    public String getBackgroundPath() {
        Resource backgroundRes = page.getContentResource().getChild("back");
        return getImageUrl(backgroundRes);
    }

    private String getImageUrl(Resource r) {
        if (r == null) return "";
        Image image = new Image(r);
        image.setSelector(".img");
        return image.getSrc();
    }
}