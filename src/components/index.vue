<template>
	<div class="page">
		<mt-header fixed title="音乐馆" class="music-header"></mt-header>
		<form >
			<mt-search v-model="searchValue" placeholder="搜索" class="music-search">
				<div class="hotkey-list" v-if="searchState==0">
					<p>热门搜索</p>
					<ul class="hotkey-list">
						<template v-for="(item,index) in hotkeys">
							<template v-if="index==0">
								<li class="special" @click="goSpecial(item.url)">{{ item.k }}</li>
							</template>
							<template v-else>
								<li @click="hotkeySearch(item.k)">{{ item.k }}</li>
							</template>
						</template>
					</ul>
				</div>
				<div class="result-list" v-if="searchState==2">
					<mt-cell class="music-cell-type5" v-for="(item,index) in searchResult" key="index" @click.native="playSingleMusic(item)">
						<i class="music-icon"></i>
						<div class="song-wrapper">
							<p>{{ item.name }}</p>
							<p>{{ item.singer }}</p>
						</div>
					</mt-cell>	
				</div>
			</mt-search>
		</form>
		<div class="page-content" style="margin-top: 122px;padding-top: 0;">
			<swiper :options="swiperOption" ref="mySwiper" class="swiper-box">
				<swiper-slide v-for="(item,index) in indexMsg.slider" :key="index" class="swiper-slide">
					<img :src="item.picUrl" class="swiper-item">
				</swiper-slide>
				<div class="swiper-pagination" slot="pagination"></div>
			</swiper>

			<ul class="radio-list">
				<li v-for="item in musiclist" @click="$router.push({name: item.route})">
					<img :src="require(`../assets/img/${item.icon}`)" class="icon" >
					<span class="name">{{ item.name }}</span>
				</li>
			</ul>

			<div class="recommend-wrapper">
				<p class="title">热 门 推 荐</p>
				<ul class="recommend-list" style="padding-left: 0px;">
					<router-link v-for="(item,index) in indexMsg.songList" tag="li" key="index" :to="{ name: 'recommend', params: {id: item.id}}">
					<div class="cover-wrapper">
						<img :src="item.picUrl">
						<span class="listen-count">
							<i class="listen-icon"></i>
							{{ item.accessnum | listenFormat }}万
						</span>
						<i class="listen-play"></i>
					</div>
					<span class="song-desc">{{ item.songListDesc }}</span>
					</router-link>
				</ul>
			</div>
		</div>
	</div>
</template>
<script>
	import { Header,Search } from 'mint-ui';//mint-ui组件
	import { apiHandler } from '@/api/index';//api
	import { dealHotkey } from '@/util/index';//util全局公用函数
	import { swiper,swiperSlide } from 'vue-awesome-swiper';//swiper图片轮播
	import Vue from 'vue';
	const NameSpace = 'playing';

	export default {
		name:'index',
		components: {
			swiper,
			swiperSlide
			//searchVue
		},
		data() {
			return {
				searchVisible: false,
				searchValue: '',
				searchState: 0,
				searchResult: {},
				hotkeys: {},
				indexMsg: {},
				swiperOption: {
					//autoplay:1000,
					initialSlide: 0,//初始化索引
					loop: true,
					pagination: '.swiper-pagination'//分页器
				},
				musiclist: [
					{
						icon: 'people.png',
						name: '歌手',
						route: 'singerlist'
					},
					{
						icon: 'rank.png',
						name: '排行',
						route: 'topList'
					},
					{
						icon: 'radio.png',
						name: '电台',
						route: 'radio'
					}
				]
			}
		},
		created() {
			apiHandler('indexMsg',(response) => {
				console.log('indexMsg',response);
				this.indexMsg=response.data;
			apiHandler('hotkey',(response) => {
				console.log('hotkey',response);
				this.hotkeys=dealHotkey(response.data)
			}); 
			});
		},
		methods: {
			hotkeySearch(hotkey){
				this.searchValue = hotkey;
				this.searching();
			},
			searching(e) {
				e && e.preventDefault();
				let searchValue = this.searchValue;
				this.searchState = 1;
				apiHandler({
					name: 'search',
					params: {
						key: searchValue
					}
				},response => {
					console.log('轮播',response.data);
					this.searchState = 2;
					this.searchResult = response.data.song.itemlist || [];
				});
			},
			playSingleMusic(song = {}) {
				let songObj = {
					data: {
						songid: song.id,
						songname: song.name,
						singer: [{
							name: song.singer
						}]
					}
				};
				store.commit(NameSpace + '/stackSonglist', songObj);
				store.dispatch(NameSpace + '/playSong', 0);
			}
		},
		watch: {
			searchVisible(visible) {
				if(!visible) {
					this.searchState = 0;
					this.searchResult = [];
				}
			},
			searchState(state) {
				if(state == 1) {
					this.$indicator.open(`正在搜索$(this.searchValue`);
				}else {
					this.$indicator.close();
				}
			}
		}
	}
</script>
<style lang="scss">
	.page {
		position: absolute;
		left: 0;
		right: 0;
		top: -15px;
		bottom: 0;
		background-color: #F4F4F4;
		overflow: hidden;
	}
	.page-content {
  		position: absolute;
    	padding-top: 40px;
    	margin-bottom: 60px;
  		left: 0;
    	right: 0;
    	top: 0;
    	bottom: 0;
    	background-color: transparent;
    	overflow: auto;
	}
	.music-header {
		background-color: #31c27c;
		color: #fff;
		font-size: 10px;
		height: 70px;
		line-height: 80px;
		text-align: center;
		position: relative;
		font-size: 20px;
	}
	.music-search {
		max-width: 100%;
		height: 51px;
		background-color: #31c27c;
		position: fixed;
		z-index: 2;
		left: 0;
		right: 0;
		top: 0;
		margin-top: 60px;
	}
	.swiper-box {
    	width: 100%;
    	height: 150px;
    	overflow: hidden;
    	margin: 0 auto;
  	}
	.swiper-item{
		display: block;
		max-width: 100%;
		height: auto;
	}
	.swiper-container .swiper-item img {
		vertical-align: middle;
		border-style: none;
	}
	.radio-list {
		display: flex;
		justify-content: space-between;
		padding: 20px;
		>li {
			display: flex;
			flex: 1;
			justify-content: center;
			align-items: center;
			.icon {
				display: inline-block;
				width: 30px;
				height: 30px;
				margin-right: 10px;
			}
			.name {
				font-size: 14px;
			}
		}
	}
	.recommend-wrapper {
		.title {
			text-align: center;
			line-height: 48px;
			font-size: 20px;
		}
		.recommend-list {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			>li {
				list-style-type: none;
				flex-basis: 33%;
				.cover-wrapper {
					position: relative;
					.listen-count {
						position: absolute;
						top: 100%;
						margin-top: -16px;
						font-size: 10px;
						color: #fff;
						.listen-icon {
							display: inline-block;
							width: 10px;
							height: 10px;
							margin-left: 3px;
							margin-right: 3px;
							background-position: 0 -50px;
							background-image: url('https://y.gtimg.cn/mediastyle/mobile/yqq_v5/img/list_sprite.png?max_age=19830212&d=20151105145423');
							background-repeat: no-repeat;
							background-size: 24px 60px;
						}
					}
					.listen-play {
				    	    position: absolute;
						    top: 100%;
						    right: 5px;
						    width: 24px;
						    height: 24px;
						    margin-top: -28px;
						    background: url('https://y.gtimg.cn/mediastyle/mobile/yqq_v5/img/list_sprite.png?max_age=19830212&d=20151105145423');
						    background-repeat: no-repeat;
						    background-size: 24px 60px;
				    }
					img {
						display: block;
						max-width: 100%;
						height: auto;
					}
				}
				.song-desc {
					display: block;
					padding: 5px;
					font-size: 12px;
					line-height: 1.2;
					height: 40px;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}
	}
</style>