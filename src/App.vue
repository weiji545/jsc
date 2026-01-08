<template>
  <div id="app">
    <!-- 模拟生产环境的外部容器 -->
    <div class="production-portal">
      <!-- 模拟侧边栏 -->
      <aside class="portal-sidebar">
        <div class="portal-logo">
          <div class="logo-box">
            <i class="el-icon-platform-eleme"></i>
          </div>
          <span class="logo-text">企业统一门户</span>
        </div>
        <div class="portal-menu">
          <div class="menu-group">核心业务</div>
          <div class="menu-item">
            <i class="el-icon-monitor"></i>
            <span>首页看板</span>
          </div>
          <div class="menu-item active">
            <i class="el-icon-data-line"></i>
            <span>决策看板</span>
            <span class="badge">PROD</span>
          </div>
          <div class="menu-item">
            <i class="el-icon-bank-card"></i>
            <span>资金管理</span>
          </div>
          
          <div class="menu-group" style="margin-top: 20px;">系统配置</div>
          <div class="menu-item">
            <i class="el-icon-user"></i>
            <span>用户权限</span>
          </div>
          <div class="menu-item">
            <i class="el-icon-setting"></i>
            <span>全局设置</span>
          </div>
        </div>
        <div class="sidebar-footer">
          <i class="el-icon-info"></i>
          <span>v2.4.0-stable</span>
        </div>
      </aside>

      <!-- 模拟主体区域 -->
      <main class="portal-content">
        <!-- 模拟顶栏 -->
        <header class="portal-header">
          <div class="header-left">
            <div class="fold-btn">
              <i class="el-icon-s-fold"></i>
            </div>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>经营分析</el-breadcrumb-item>
              <el-breadcrumb-item>驾驶舱看板</el-breadcrumb-item>
              <el-breadcrumb-item><b>资金决策大屏</b></el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <div class="action-icons">
              <i class="el-icon-search"></i>
              <i class="el-icon-question"></i>
              <el-badge :value="3" class="notice-badge">
                <i class="el-icon-bell"></i>
              </el-badge>
            </div>
            <div class="user-profile">
              <div class="avatar">
                <img src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" alt="">
              </div>
              <span class="user-name">超级管理员</span>
              <i class="el-icon-caret-bottom"></i>
            </div>
          </div>
        </header>

        <!-- 项目实际嵌套的区域 -->
        <div class="nested-project-area">
          <div class="production-sim-overlay">
            <span class="env-tag">PRODUCTION ENVIRONMENT</span>
          </div>
          <div class="project-wrapper-card">
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
// 全局样式重置
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f0f2f5;
  color: #333;
}

.production-portal {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;

  .portal-sidebar {
    width: 240px;
    height: 100%;
    background: #001529;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    z-index: 100;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);

    .portal-logo {
      height: 64px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #002140;

      .logo-box {
        width: 32px;
        height: 32px;
        background: #1890ff;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 20px;
      }
      
      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        letter-spacing: 1px;
      }
    }

    .portal-menu {
      flex: 1;
      padding: 16px 0;
      overflow-y: auto;

      .menu-group {
        padding: 8px 24px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .menu-item {
        height: 50px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: rgba(255, 255, 255, 0.65);
        cursor: pointer;
        transition: all 0.3s;
        position: relative;

        i { font-size: 18px; }
        span { font-size: 14px; }

        .badge {
          background: #f5222d;
          color: #fff;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: auto;
          font-weight: bold;
        }

        &:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }

        &.active {
          color: #fff;
          background: #1890ff;
          
          &::after {
            content: "";
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: #fff;
          }
        }
      }
    }

    .sidebar-footer {
      padding: 16px 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.3);
      font-size: 12px;
    }
  }

  .portal-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: #f0f2f5;

    .portal-header {
      height: 64px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      color: #333;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
      z-index: 99;

      .header-left {
        display: flex;
        align-items: center;
        gap: 20px;
        
        .fold-btn {
          font-size: 20px;
          cursor: pointer;
          color: #666;
          &:hover { color: #1890ff; }
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 24px;

        .action-icons {
          display: flex;
          align-items: center;
          gap: 20px;
          color: #666;
          i { font-size: 18px; cursor: pointer; &:hover { color: #1890ff; } }
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.3s;

          &:hover { background: rgba(0, 0, 0, 0.02); }

          .avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            overflow: hidden;
            background: #eee;
            img { width: 100%; height: 100%; object-fit: cover; }
          }
          .user-name { font-size: 14px; font-weight: 500; color: #333; }
          i { font-size: 12px; color: #999; }
        }
      }
    }

    .nested-project-area {
      flex: 1;
      position: relative;
      overflow: hidden;
      padding: 24px;
      display: flex;
      flex-direction: column;

      .production-sim-overlay {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1000;
        pointer-events: none;
        
        .env-tag {
          display: inline-block;
          background: #52c41a;
          color: #fff;
          font-size: 10px;
          font-weight: bold;
          padding: 4px 20px;
          transform: rotate(45deg) translate(25px, -15px);
          width: 150px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      }

      .project-wrapper-card {
        flex: 1;
        background: #000; // 模拟大屏背景
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        position: relative;
        border: 1px solid rgba(0,0,0,0.1);
      }
    }
  }
}

/* 隐藏全局滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}
::-webkit-scrollbar-track {
  background: transparent;
}

/* 下拉弹层不影响主体布局 */
:global(.el-select-dropdown),
:global(.el-popper) {
  margin: 0;
}
</style>
