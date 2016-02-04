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
           import="com.day.cq.commons.TidyJSONWriter,
                  org.apache.sling.api.resource.Resource,
                  com.day.cq.commons.jcr.JcrConstants,
                  com.day.cq.wcm.api.components.IncludeOptions,
                  org.apache.sling.commons.json.JSONObject"%><%
%><%@include file="/libs/foundation/global.jsp"%><%

    final String ATTRIBUTE_CHILD_JSON = "CHILD_JSON_OBJECT";
    response.setContentType("application/json");
    response.setCharacterEncoding("utf-8");

    // Prevent html decorations in the JSON
    IncludeOptions opts = IncludeOptions.getOptions(request, true);
    opts.setDecorationTagName("");
    opts.forceSameContext(Boolean.TRUE);
    //
    // Return all locations as JSON data
    //
    TidyJSONWriter writer = new TidyJSONWriter(response.getWriter());
    writer.setTidy(true);
    writer.array();
    Resource res = resource;
    if (res.getName().equals(JcrConstants.JCR_CONTENT)) {
        res = res.getParent();
    }
    Iterable<Resource> children = res.getChildren();
    for (Resource child : children) {
        if (child.getName().startsWith("jcr:")) {
            continue;
        } %>


<sling:include path="<%= child.getPath() + "/_jcr_content" %>" replaceSelectors="locationdata.json"/><%
        JSONObject childJson = (JSONObject) request.getAttribute(ATTRIBUTE_CHILD_JSON);
        if (childJson != null) {
            writer.value(childJson);
        }
        request.removeAttribute(ATTRIBUTE_CHILD_JSON);
    }
    writer.endArray();
    response.flushBuffer();
%>
