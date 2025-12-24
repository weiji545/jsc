<template>
  <div class="container">
    <div class="maps-container">
      <!-- 阴影地图 - 只用于显示阴影 -->
      <div id="shadow-map"></div>
      <!-- 主地图 - 用于交互和显示数据 -->
      <div id="main-map"></div>
    </div>
  </div>
</template>
<script>
import * as echarts from "echarts";
import chinaJson from "./china.json";
export default {
  name: "ChinaMap",
  data() {
    return {
      shadowChart: null,
      mainChart: null,
      highlightProvinces: [],
      currentHighlightIndex: 0,
      highlightInterval: 3000,
      isRotating: false,
      highlightTimer: null,
      outId: null,
      geojsonData: null,
    };
  },
  mounted() {
    this.initMaps();
  },
  beforeDestroy() {
    console.log(123);

    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    async initMaps() {
      // 加载地理数据
      //   this.geojsonData = chinadata
      // const res = await fetch(
      //   "./china.geojson"
      // );
      // const chinaJson = await res.json();
      // console.log(chinaJson);

      // 注册地图数据
      echarts.registerMap("china", chinaJson);

      // 获取所有省份名称
      const allProvinces = [];
      chinaJson.features.forEach((feature) => {
        if (feature.properties && feature.properties.name) {
          allProvinces.push(feature.properties.name);
        }
      });

      // 创建数据
      const dataValues = [20000000, 80000000, 250000000, 340000000];
      let dataIndex = 0;
      const allData = allProvinces.map((provinceName) => {
        if (dataIndex > dataValues.length - 1) {
          dataIndex = 0;
        }
        return {
          name: provinceName,
          value: dataValues[dataIndex++],
        };
      });
      console.log(allData);
      this.highlightProvinces = allData
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map((item) => item.name);

      // ========== 初始化阴影地图 ==========
      const shadowDom = document.getElementById("shadow-map");
      this.shadowChart = echarts.init(shadowDom);

      const shadowOption = {
        backgroundColor: "transparent",
        tooltip: {
          show: false, // 阴影层不显示tooltip
        },
        series: [
          {
            type: "map",
            map: "china",
            roam: false, // 不允许缩放和平移
            silent: true, // 不响应任何事件
            zoom: 1.5,
            center: [104.195397, 35.86166],
            label: {
              show: false, // 不显示标签
            },
            itemStyle: {
              areaColor: "rgba(11, 79, 157, 0.6)", // 深色阴影
              borderColor: "rgba(0, 0, 0, 0.8)",
              borderWidth: 1,
              shadowColor: "rgba(0, 0, 0, 0.8)",
              shadowBlur: 10,
              shadowOffsetX: 5,
              shadowOffsetY: 5,
            },
            emphasis: {
              disabled: true, // 禁用高亮
            },
            select: {
              disabled: true, // 禁用选择
            },
            // data: allData.map(item => ({
            //   ...item,
            //   value: 0 // 阴影层不需要数据值
            // }))
          },
        ],
        // 移除不必要的组件
        visualMap: { show: false },
        legend: { show: false },
        grid: { show: false },
        xAxis: { show: false },
        yAxis: { show: false },
      };

      this.shadowChart.setOption(shadowOption);

      // ========== 初始化主地图 ==========
      const mainDom = document.getElementById("main-map");
      console.log(mainDom.clientHeight, shadowDom.clientHeight);

      this.mainChart = echarts.init(mainDom);
      const mainOption = {
        backgroundColor: "transparent",
        tooltip: {
          trigger: "item",
          formatter: (params) => {
            if (params.value) {
              return `
                <div style="
                  padding: 12px;
                  background: rgba(255, 255, 255, 0.95);
                  border-radius: 6px;
                  border: 1px solid #e6e6e6;
                  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                  min-width: 180px;
                ">
                  <div style="
                    margin-bottom: 8px;
                    color: #265CE0;
                    font-weight: bold;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 6px;
                  ">
                    <span style="
                      display: inline-block;
                      width: 10px;
                      height: 10px;
                      border-radius: 50%;
                      background: #FFDD33;
                      margin-right: 6px;
                    "></span>
                    ${params.name}
                  </div>
                  <div style="margin: 6px 0; color: #555;">
                    账户数量: <span style="color: #265CE0; font-weight: bold;">${
                      Math.floor(Math.random() * 50) + 10
                    }</span>
                  </div>
                  <div style="margin: 6px 0; color: #555;">
                    账户余额: <span style="color: #1842A1; font-weight: bold;">¥${this.formatNumber(
                      params.value
                    )}</span>
                  </div>
                </div>`;
            }
            return params.name;
          },
          backgroundColor: "transparent",
          borderWidth: 0,
          padding: 0,
        },
        visualMap: {
          show: true,
          type: "piecewise",
          pieces: [
            {
              min: 0,
              max: 50000000,
              label: "0-5000万",
              color: "rgba(78,156,239,0.9)",
            },
            {
              min: 50000001,
              max: 100000000,
              label: "5000万-1亿",
              color: "rgba(38,92,224,0.9)",
            },
            {
              min: 100000001,
              max: 300000000,
              label: "1亿-3亿",
              color: "rgba(24,66,161,0.9)",
            },
            { min: 300000001, label: "3亿以上", color: "rgba(0,34,110,0.9)" },
          ],
          textStyle: {
            color: "#fff",
            fontSize: 12,
          },
          left: "0",
          bottom: "left",
          itemWidth: 20,
          itemHeight: 20,
          itemGap: 6,
        },
        series: [
          {
            type: "map",
            map: "china",
            roam: true,
            zoom: 1.5,
            center: [104.195397, 35.86166],
            label: {
              show: true,
              color: "#fff",
              fontSize: 11,
              fontWeight: "normal",
            },
            itemStyle: {
              areaColor: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "rgba(78,156,239,0.3)",
                  },
                  {
                    offset: 1,
                    color: "rgba(38,92,224,0.4)",
                  },
                ],
              },
              borderColor: "rgba(40,110,202,0.8)",
              borderWidth: 1,
            },
            emphasis: {
              label: {
                show: true,
                color: "#FFDD33",
                fontSize: 14,
                fontWeight: "bold",
                backgroundColor: "rgba(0,0,0,0.7)",
                padding: [3, 6],
                borderRadius: 4,
              },
              itemStyle: {
                // areaColor: {
                //   type: 'linear',
                //   x: 0,
                //   y: 0,
                //   x2: 0,
                //   y2: 1,
                //   colorStops: [{
                //     offset: 0,
                //     color: '#FFDD33'
                //   }, {
                //     offset: 1,
                //     color: '#FFBB11'
                //   }]
                // },
                areaColor: null,
                borderColor: "#FFB600",
                borderWidth: 3,
                shadowColor: "rgba(255,221,51,0.5)",
                shadowBlur: 10,
              },
            },
            data: allData,
          },
        ],
      };

      this.mainChart.setOption(mainOption);
      this.bindChartEvents();
      this.startHighlight();
      this.addevent();
      setTimeout(() => {
        if (this.shadowChart) {
          this.shadowChart.resize();
        }
        if (this.mainChart) {
          this.mainChart.resize();
        }
      }, 0);
    },
    formatNumber(num) {
      if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + "亿";
      } else if (num >= 10000) {
        return (num / 10000).toFixed(1) + "万";
      }
      return num.toString();
    },
    bindChartEvents() {
      this.mainChart.on("mouseover", (params) => {
        console.log("mouseover");
          this.outId && clearTimeout(this.outId);
        // this.isRotating = true
        if (params.seriesType === "map") {
          if (this.isRotating) {
          
            this.stopHighlight();
          }
        }
      });

      // // 鼠标移出时恢复自动高亮
      this.mainChart.on("mouseout", (params) => {
        console.log("mouseout");
        this.isRotating = false;
         this.outId && clearTimeout(this.outId);
        if (params.seriesType === "map") {
          if (!this.isRotating) {
           
            this.outId = setTimeout(() => {
              this.startHighlight();
            }, 3000); // 延迟2秒后恢复轮播
          }
        }
      });

      // // 点击省份时高亮该省份
      this.mainChart.on("click", (params) => {
        if (params.seriesType === "map") {
          this.highlightSpecificProvince(params.name);
        }
      });

      // 同步两个地图的视图
      this.mainChart.on("georoam", (params) => {
        const mainOption = this.mainChart.getOption();
        const series = mainOption.series[0];

        if (series && series.zoom && series.center) {
          this.shadowChart.setOption({
            series: [
              {
                zoom: series.zoom,
                center: series.center,
              },
            ],
          });
        }
      });
    },
    startHighlight() {
      this.stopHighlight();

      this.isRotating = true;
      this.highlightTimer = setInterval(() => {
        this.highlightNextProvince();
      }, this.highlightInterval);
      // 立即高亮第一个省份
      if (this.highlightProvinces.length > 0) {
        this.highlightSpecificProvince(this.highlightProvinces[0]);
      }
    },
    stopHighlight() {
      if (this.highlightTimer) {
        clearInterval(this.highlightTimer);
        this.highlightTimer = null;
      }
      this.isRotating = false;
      // 清除当前高亮
      this.clearCurrentHighlight();
    },
    highlightNextProvince() {
      if (this.highlightProvinces.length === 0) return;

      this.clearCurrentHighlight();

      this.currentHighlightIndex =
        (this.currentHighlightIndex + 1) % this.highlightProvinces.length;
      const provinceName = this.highlightProvinces[this.currentHighlightIndex];

      this.highlightSpecificProvince(provinceName);
    },
    highlightSpecificProvince(provinceName) {
      const mainChart = this.mainChart;

      // 取消所有高亮
      mainChart.dispatchAction({
        type: "downplay",
        seriesIndex: 0,
      });

      // 高亮指定省份
      mainChart.dispatchAction({
        type: "highlight",
        seriesIndex: 0,
        name: provinceName,
      });

      // 显示tooltip

      mainChart.dispatchAction({
        type: "showTip",
        seriesIndex: 0,
        name: provinceName,
      });
    },
    clearCurrentHighlight() {
      this.mainChart.dispatchAction({
        type: "downplay",
        seriesIndex: 0,
      });
    },
    handleResize() {
      if (this.shadowChart) {
        this.shadowChart.resize();
      }
      if (this.mainChart) {
        this.mainChart.resize();
      }
    },
    addevent() {
      window.addEventListener("resize", this.handleResize);
    },
  },
};
</script>
<style scoped>
.container {
  /* position: relative;
      width: 1600px;
      height: 800px;
      margin: 20px; */
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
}

/* 地图容器 */
.maps-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 阴影地图容器 - 向下偏移形成阴影效果 */
#shadow-map {
  position: absolute;
  top: 15px;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 主地图容器 - 正常位置 */
#main-map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

/* 控制面板 */
.control-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  background: rgba(10, 22, 64, 0.9);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 8px;
  color: white;
  width: 220px;
  border: 1px solid rgba(78, 156, 239, 0.3);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.control-panel h3 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #4e9cef;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(78, 156, 239, 0.3);
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

button {
  padding: 10px;
  background: linear-gradient(135deg, #265ce0 0%, #1842a1 100%);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  flex: 1;
}

button:hover {
  background: linear-gradient(135deg, #3d6fe0 0%, #2652b1 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(38, 92, 224, 0.3);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.highlight-info {
  margin: 10px 0;
}

.info-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 4px;
  margin: 5px 0;
  border-left: 3px solid #4e9cef;
}

.current-province {
  color: #ffdd33;
  font-weight: bold;
  font-size: 14px;
}

.interval-control {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.interval-control label {
  display: block;
  margin-bottom: 5px;
  color: #4e9cef;
  font-size: 12px;
}

.interval-control input {
  width: 100%;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid rgba(78, 156, 239, 0.5);
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>