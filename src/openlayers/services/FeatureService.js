/**
 * Class: FeatureService
 * 数据集类。
 * 提供：ID查询，范围查询，SQL查询，几何查询，bounds查询，缓冲区查询，地物编辑
 * 用法：
 *      new ol.superMap.FeatureService(url)
 *      .getFeaturesByIDs(param,function(result){
 *          //doSomething
 *      })
 */
require('./ServiceBase');
require('../../common/iServer/GetFeaturesByIDsService');
require('../../common/iServer/GetFeaturesBySQLService');
require('../../common/iServer/GetFeaturesByBoundsService');
require('../../common/iServer/GetFeaturesByBufferService');
require('../../common/iServer/GetFeaturesByGeometryService');
require('../../common/iServer/EditFeaturesService');

ol.supermap.FeatureService = function (url, options) {
    ol.supermap.ServiceBase.call(this, url, options);
};
ol.inherits(ol.supermap.FeatureService, ol.supermap.ServiceBase);

/**
 * 数据集ID查询服务
 * @param params:
 * <SuperMap.GetFeaturesByIDsParameters>
 * @param callback
 * @param resultFormat
 * <SuperMap.DataFormat>
 */
ol.supermap.FeatureService.prototype.getFeaturesByIDs = function (params, callback, resultFormat) {
    var me = this;
    var getFeaturesByIDsService = new SuperMap.REST.GetFeaturesByIDsService(me.options.url, {
        eventListeners: {
            processCompleted: callback,
            processFailed: callback
        },
        format: me._processFormat(resultFormat)
    });
    getFeaturesByIDsService.processAsync(me._processParams(params));
    return me;

};

/**
 * 数据集Bounds查询服务
 * @param params:
 * <SuperMap.GetFeaturesByBoundsParameters>
 * @param callback
 * @param resultFormat
 * <SuperMap.DataFormat>
 */
ol.supermap.FeatureService.prototype.getFeaturesByBounds = function (params, callback, resultFormat) {
    var me = this;
    var getFeaturesByBoundsService = new SuperMap.REST.GetFeaturesByBoundsService(me.options.url, {
        eventListeners: {
            processCompleted: callback,
            processFailed: callback
        },
        format: me._processFormat(resultFormat)
    });
    getFeaturesByBoundsService.processAsync(me._processParams(params));
    return me;
};

/**
 * 数据集Buffer查询服务
 * @param params:
 * <SuperMap.GetFeaturesByBufferParameters>
 * @param callback
 * @param resultFormat
 * <SuperMap.DataFormat>
 */
ol.supermap.FeatureService.prototype.getFeaturesByBuffer = function (params, callback, resultFormat) {
    var me = this;
    var getFeatureService = new SuperMap.REST.GetFeaturesByBufferService(me.options.url, {
        eventListeners: {
            processCompleted: callback,
            processFailed: callback
        },
        format: me._processFormat(resultFormat)
    });
    getFeatureService.processAsync(me._processParams(params));
    return me;
};

/**
 * 数据集SQL查询服务
 * @param params:
 * <SuperMap.GetFeaturesBySQLParameters>
 * @param callback
 * @param resultFormat
 * <SuperMap.DataFormat>
 */
ol.supermap.FeatureService.prototype.getFeaturesBySQL = function (params, callback, resultFormat) {
    var me = this;
    var getFeatureBySQLService = new SuperMap.REST.GetFeaturesBySQLService(me.options.url, {
        eventListeners: {
            processCompleted: callback,
            processFailed: callback
        },
        format: me._processFormat(resultFormat)
    });

    getFeatureBySQLService.processAsync(me._processParams(params));
    return me;
};

/**
 * 数据集几何查询服务类
 * @param params:
 * <SuperMap.GetFeaturesByGeometryParameters>
 * @param callback
 * @param resultFormat
 * <SuperMap.DataFormat>
 */
ol.supermap.FeatureService.prototype.getFeaturesByGeometry = function (params, callback, resultFormat) {
    var me = this;
    var getFeaturesByGeometryService = new SuperMap.REST.GetFeaturesByGeometryService(me.options.url, {
        eventListeners: {
            processCompleted: callback,
            processFailed: callback
        },
        format: me._processFormat(resultFormat)
    });
    getFeaturesByGeometryService.processAsync(me._processParams(params));
    return me;
};

/**
 *  地物编辑服务
 * @param params
 * <SuperMap.EditFeaturesParameters>
 * @param callback
 */
ol.supermap.FeatureService.prototype.editFeatures = function (params, callback) {
    if (!params || !params.dataSourceName || !params.dataSetName) {
        return;
    }
    var me = this,
        url = me.options.url,
        dataSourceName = params.dataSourceName,
        dataSetName = params.dataSetName;

    url += "/datasources/" + dataSourceName + "/datasets/" + dataSetName;
    editFeatureService = new SuperMap.REST.EditFeaturesService(url, {
        eventListeners: {
            processCompleted: callback,
            processFailed: callback
        }
    });
    editFeatureService.processAsync(me._processParams(params));
    return me;
};

ol.supermap.FeatureService.prototype._processParams = function (params) {
    if (!params) {
        return {};
    }
    var me = this;
    params.returnContent = (params.returnContent == null) ? true : params.returnContent;
    params.fromIndex = params.fromIndex ? params.fromIndex : 0;
    params.toIndex = params.fromIndex ? params.fromIndex : -1;
    if (params.bounds) {
        params.bounds = new SuperMap.Bounds(
            params.bounds[0],
            params.bounds[1],
            params.bounds[2],
            params.bounds[3]
        );
    }
    if (params.geometry) {
        params.geometry = ol.supermap.Util.toSuperMapGeometry(JSON.parse((new ol.format.GeoJSON()).writeGeometry(params.geometry)));
    }
    if (params.editType) {
        params.editType = params.editType.toLowerCase();
    }
    if (params.features) {
        var features = [];
        if (ol.supermap.Util.isArray(params.features)) {
            params.features.map(function (feature) {
                features.push(me._createServerFeature(feature));
            });
        } else {
            features.push(me._createServerFeature(params.features));
        }
        params.features = features;
    }
    return params;
};

ol.supermap.FeatureService.prototype._createServerFeature = function (geoFeature) {
    var geoJSONFeature, feature = {}, fieldNames = [], fieldValues = [];
    geoJSONFeature = JSON.parse((new ol.format.GeoJSON()).writeGeometry(geoFeature));
    for (var key in geoJSONFeature) {
        fieldNames.push(key);
        fieldValues.push(geoJSONFeature[key]);
    }
    feature.fieldNames = fieldNames;
    feature.fieldValues = fieldValues;
    feature.geometry = ol.supermap.Util.toSuperMapGeometry(geoJSONFeature);
    return feature;
};

ol.supermap.FeatureService.prototype._processFormat = function (resultFormat) {
    return (resultFormat) ? resultFormat : SuperMap.DataFormat.GEOJSON;
};

module.exports = ol.supermap.FeatureService;
