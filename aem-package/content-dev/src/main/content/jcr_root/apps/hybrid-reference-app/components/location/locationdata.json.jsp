<%--
    ADOBE CONFIDENTIAL
    __________________
     Copyright 2013 Adobe Systems Incorporated
     All Rights Reserved.
    NOTICE:  All information contained herein is, and remains
    the property of Adobe Systems Incorporated and its suppliers,
    if any.  The intellectual and technical concepts contained
    herein are proprietary to Adobe Systems Incorporated and its
    suppliers and are protected by trade secret or copyright law.
    Dissemination of this information or reproduction of this material
    is strictly forbidden unless prior written permission is obtained
    from Adobe Systems Incorporated.
--%><%
%><%@ page session="false"
           import=" com.day.cq.wcm.api.components.IncludeOptions,
                    org.apache.sling.commons.json.JSONObject,
                    com.adobe.cq.address.api.location.LocationManager,
                    com.adobe.cq.address.api.location.Location,
                    com.adobe.cq.address.api.location.LocationManager,
                    org.apache.sling.api.resource.Resource,
                    com.day.cq.wcm.foundation.Image,
                    com.adobe.cq.mobile.angular.data.util.FrameworkContentExporterUtils,
                    org.apache.sling.api.SlingHttpServletRequest,
                    org.apache.sling.commons.json.JSONException, org.apache.sling.api.resource.ValueMap" %><%
%><%@include file="/libs/foundation/global.jsp" %>
<%

    response.setContentType("application/json");
    response.setCharacterEncoding("utf-8");

    IncludeOptions opts = IncludeOptions.getOptions(request, true);
    opts.setDecorationTagName("");
    opts.forceSameContext(Boolean.TRUE);

    LocationManager locMgr = slingRequest.getResourceResolver().adaptTo(LocationManager.class);
    Location location = locMgr.getLocation(properties.get("./location", String.class));
    ValueMap locationProps = resource.adaptTo(ValueMap.class);

    JSONObject locationJson = new JSONObject();

    try {

        if (locationProps.containsKey("master")) {
            locationJson.put("master", locationProps.get("master", false));
        }

        locationJson.put("title", new String(location.getTitle()));
        locationJson.put("description", new String(location.getDescription()));

        String address = location.getFullAddress();
        address = address.replaceAll(System.getProperty("line.separator"), " ").trim();

        locationJson.put("address", new String(address));
        locationJson.put("phone", new String(location.getPhone()));
        locationJson.put("latitude", new Double(location.getCoordinates().getLat()));
        locationJson.put("longitude", new Double(location.getCoordinates().getLng()));

        Resource cardsRes = slingRequest.getResource().getChild("cards");
        if (cardsRes != null) {
            locationJson.put("imgUrl1", getImageUrl(slingRequest, cardsRes.getChild("img1")));
            locationJson.put("imgUrl2", getImageUrl(slingRequest, cardsRes.getChild("img2")));
            locationJson.put("imgUrl3", getImageUrl(slingRequest, cardsRes.getChild("img3")));
        }
        locationJson.put("detailsUrl", resource.getParent().getName());

    } catch (JSONException e) {
        // unable to create json object
    }

    request.setAttribute("CHILD_JSON_OBJECT", locationJson);
%><%!

    String getImageUrl(SlingHttpServletRequest request, Resource r) {
        if (r == null) return "";
        Image image = new Image(r);
        image.setSelector(".img");
        Resource topLevelResource = r.getResourceResolver().getResource("/");
        String imageSrc = FrameworkContentExporterUtils.getPathToAsset(topLevelResource, request.getContextPath() + image.getSrc(), true);
        return imageSrc;
    }
%>
