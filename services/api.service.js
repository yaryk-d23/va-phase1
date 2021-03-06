(function () {
    angular.module('App')
        .factory('$ApiService', function ($http, $q) {
            return {
                getListItems: getListItems,
                getListChoiceField: getListChoiceField,
                getUser: getUser,
                getCurrentUser: getCurrentUser,
                saveData: saveData,
                deleteListItem: deleteListItem,
                getFormDigestValue: getFormDigestValue,
                uploadFile: uploadFile,
                uploadAttachments: uploadAttachments,
                updateListItem: updateListItem,
            };

            function getListItems(listTitle, params) {
                return $http.get(window["SITE_LOCATION_URL"] + '/_api/web/lists/getbytitle(\'' + listTitle + '\')/items?' + params || "")
                    .then(function (res) {
                        return res.data.value;
                    }, error => error);
            }

            function getListChoiceField(listTitle, fieldName) {
                return $http({
                    url: window["SITE_LOCATION_URL"] +
                        '/_api/web/lists/getbytitle(\'' + listTitle + '\')/fields?' +
                        '$filter=EntityPropertyName eq \'' + fieldName + '\'',
                    method: 'GET',
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose"
                    }
                }).then(function (res) {
                    return res.data.d.results[0];
                }, error => error);
            }

            function getCurrentUser(params) {
                return $http.get(window["SITE_LOCATION_URL"] + '/_api/web/currentuser?' + params)
                    .then(function (res) {
                        return res.data;
                    });
            }

            function getUser(query) {
                var url = window["SITE_LOCATION_URL"] +
                    "/_api/web/SiteUserInfoList/Items?" +
                    "$select=" + [
                        "*",
                        "Name",
                        "Id",
                        "Title",
                        "EMail",
                        "Properties/Title,Properties/Department"
                    ].join(",") +
                    "&$expand=Properties" +
                    "&$top=100" +
                    "&$filter=(" + [
                        "substringof('" + query + "',Title)",
                        "substringof('" + query + "',EMail)",
                        "substringof('" + capitalizeFirstLetter(query) + "',Title)",
                        "substringof('" + capitalizeFirstLetter(query) + "',EMail)"
                    ].join(" or ")
                    + ")";
                return $http({
                    method: 'GET',
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose"
                    },
                    url: url
                }).then(function (res) {
                    return res.data.d.results;
                }, error => error);
            }

            function saveData(listTitle, data) {
                return new Promise(function (resolve, reject) {
                    getFormDigestValue().then(function (formDigestValue) {
                        $http({
                            url: window["SITE_LOCATION_URL"] +
                                '/_api/web/lists/getbytitle(\'' + listTitle + '\')/Items?$select=*',
                            method: 'POST',
                            headers: {
                                "accept": "application/json;odata=verbose",
                                "content-type": "application/json;odata=verbose",
                                "X-RequestDigest": formDigestValue
                            },
                            data: data
                        }).then(function (res) {
                            resolve(res.data.d);
                        }, error => reject(error));
                    });
                });
            }


            function updateListItem(listTitle, itemId, data) {
                return new Promise(function (resolve, reject) {
                    getFormDigestValue().then(function (formDigestValue) {
                        $http({
                            url: window["SITE_LOCATION_URL"] +
                                '/_api/web/lists/getbytitle(\'' + listTitle + '\')/Items(' + itemId + ')?$select=*',
                            method: 'POST',
                            headers: {
                                "accept": "application/json;odata=verbose",
                                "content-type": "application/json;odata=verbose",
                                "X-RequestDigest": formDigestValue,
                                "IF-MATCH": "*",
                                "X-HTTP-Method": "MERGE"
                            },
                            data: data
                        }).then(function (res) {
                            resolve(res.data.value);
                        });
                    });
                });
            }


            function deleteListItem(listTitle, itemId) {
                return new Promise(function (resolve, reject) {
                    getFormDigestValue().then(function (formDigestValue) {
                        $http({
                            url: window["SITE_LOCATION_URL"] +
                                '/_api/web/lists/getbytitle(\'' + listTitle + '\')/Items(' + itemId + ')',
                            method: 'POST',
                            headers: {
                                "accept": "application/json;odata=verbose",
                                "content-type": "application/json;odata=verbose",
                                "X-RequestDigest": formDigestValue,
                                'X-HTTP-Method': 'DELETE',
                                "IF-MATCH": "*"
                            },
                        }).then(function (res) {
                            resolve(true);
                        });
                    });
                });
            }

            function uploadAttachments(listTitle, itemId, file) {
                return new Promise(function (resolve, reject) {
                    getFormDigestValue().then(function (formDigestValue) {
                        $http({
                            url: window["SITE_LOCATION_URL"] +
                                '/_api/web/lists/getbytitle(\'' + listTitle + '\')/Items(' + itemId + ')/AttachmentFiles/add(FileName=\'' + file.name + '\')?$select=*',
                            method: 'POST',
                            data: file,
                            headers: {
                                "accept": "application/json;odata=verbose",
                                "content-type": file.type,
                                "X-RequestDigest": formDigestValue
                            },
                            data: file
                        }).then(function (res) {
                            resolve(res.data.d);
                        });
                    });
                });
            }

            function getFormDigestValue() {
                return new Promise(function (resolve, reject) {
                    $http({
                        url: window["SITE_LOCATION_URL"] + '/_api/contextinfo',
                        method: 'POST',
                        headers: {
                            "accept": "application/json;odata=verbose",
                            "contentType": "text/xml"
                        },
                    }).then(function (res) {
                        resolve(res.data.d.GetContextWebInformation.FormDigestValue);
                    }, error => reject(error));
                });
            }

            function uploadFile(libraryTitle, data, spdata) {
                return new Promise(function (resolve, reject) {
                    getFormDigestValue().then(function (formDigestValue) {
                        var addToFileName = "---" + (new Date).getTime() + "---" + Math.random() + "---";
                        var input_file_name = data.name.split('.');
                        var ext = input_file_name.pop();
                        input_file_name = input_file_name.join(".")
                        input_file_name = input_file_name.substring(0, 50)
                        input_file_name = input_file_name + "." + ext

                        var config = {
                            headers: {
                                "Accept": "application/json; odata=verbose",
                                "X-RequestDigest": formDigestValue,
                                "Content-Type": undefined
                            },
                            responseType: "arraybuffer"
                        };
                        var url = window["SITE_LOCATION_URL"] +
                            "/_api/web/lists/GetByTitle('" + libraryTitle + "')/RootFolder/Files/add(overwrite=true, url='" + addToFileName + input_file_name + "')?$select=ServerRelativeUrl,ListItemAllFields/Id&$expand=ListItemAllFields";
                        $http({
                            method: "POST",
                            url: url,
                            processData: false,
                            data: data,
                            headers: config.headers
                        }).then(function (res) {
                            var createFileRes = res;
                            var id = res.data.d.ListItemAllFields.Id;
                            var OldServerRelativeUrl = res.data.d.ServerRelativeUrl;
                            var ServerRelativeUrl = OldServerRelativeUrl.split("/");
                            var file_name = ServerRelativeUrl.pop();
                            file_name = file_name.replace(addToFileName, "");
                            file_name = file_name.split('.');
                            var ext = file_name.pop();
                            file_name = file_name.join(".") + "-" + id + "." + ext;
                            ServerRelativeUrl.push(file_name);
                            ServerRelativeUrl = ServerRelativeUrl.join("/");
                            $http({
                                method: 'POST',
                                url: window["SITE_LOCATION_URL"] + "/_api/web/getfilebyserverrelativeurl('" + OldServerRelativeUrl + "')/moveto(newurl='" + ServerRelativeUrl + "',flags=1)",
                                headers: {
                                    "Accept": "application/json;odata=verbose",
                                    "content-type": "application/json;odata=verbose",
                                    "X-RequestDigest": formDigestValue
                                }
                            }).then(function () {
                                if (spdata) {
                                    updateListItem(libraryTitle, id, spdata).then(function () {
                                        resolve(createFileRes.data.d);
                                    });
                                }
                                else {
                                    resolve(createFileRes.data.d);
                                }
                            });
                        });
                    });
                });

            }

            function removeFileFromLib(libTitle, fileName) {
                return new Promise(function (resolve, reject) {
                    getFormDigestValue().then(function (formDigestValue) {
                        $http({
                            url: window["SITE_LOCATION_URL"] +
                                '/_api/web/GetFileByServerRelativeUrl(\'' + CONSTANT.webServerRelativeUrl + "/" + libTitle + "/" + fileName + '\')',
                            method: 'POST',
                            headers: {
                                "accept": "application/json;odata=verbose",
                                "content-type": "application/json;odata=verbose",
                                "X-RequestDigest": formDigestValue,
                                'X-HTTP-Method': 'DELETE',
                                "IF-MATCH": "*"
                            },
                        }).then(function (res) {
                            resolve(res);
                        });
                    });
                });
            }

            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

        });
})();