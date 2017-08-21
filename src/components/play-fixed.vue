<template>
	<div class="fixed-wrapper">
		<mt-cell class="music-cell-song-fixed">
			<router-link tag="div" :to="{name: 'playing'}"	 class="song-cover">
			 	<img :src="ablumImgUrl" 	class="song-album-img">
				<div class="name-desc">
					<p>{{ songMsg.data.songname }}</p>
					<p>{{ currentLyric || (songMsg.data.singer && songMsg.data.singer[0].name) }}</p>
				</div>
			</router-link>
			<div class="play-wrapper">
				<div class="circle-wrapper">
				<!-- 大概率是播放键的圆圈效果 -->
					<svg width="24px" height="24px" xmlns="http://www.w3.org/2000/svg" class="progress-circle">
						<cirle cx="12" cy="12" r="11.1" ref="progress" :style="{strokeDasharray: playingPrgress*70+ ',70'}"></cirle>	
					</svg>
					<img :src="require(`@/assets/img/${this.songState.playingState == 'pause' ? 'play-small':'pause'}.png`)" 
						 @click="pause(playingState == 'pause' ? '' : 'pause')" class="play-icon">
				</div>
				<!-- 播放列表图标 -->
				<img src="../assets/img/list-green.png" @click="toggleShow" class="list-icon">
			</div>
		</mt-cell>
		<audio :src="songMsg.getMedia(songMsg.data.songid)" ref="audio" 	></audio>
	</div>
</template>
<script>
	import utf8 from 'utf8';
	import base64 from 'base-64';
	import store from '../store';
	import { jsonp } from '@/api/index';
	import { lyricsAnalysis } from '../util';
	import { mapState,mapMutations,mapActions } from 'vuex';
	const NameSpace = 'playing'

	export default {
		name: 'play-fixed',
		data() {
			return {
				currentLyric: '',
				lyricsObj: {
					timeArr: [],    //
					lyricsArr: [],  //
					durationArr: [] //
				},
				swipeObj: {
					start: {
						x: 0
					},
					move: {
						x:0
					}
				}
			};
		},
		computed: {
			...mapState(NameSpace, ['songMsg', 'songState']),
			playingState() {
				return this.songState.playingState;	
			},
			playingSongid() {
				return this.songMsg.data.songid;
			},
			playingPrgress() {
				return this.songState.playingProgress;
			},
			currentTime() {
				return this.songState.current;
			},
			pruneTime() {
				return this.songState.pruneTime;
			},
			ablumImgUrl() {
				let albummid = this.songMsg.data.albummid;
				if (albummid) {
					return this.songMsg.songblum_prfix + albummid + '.jpg?max_age=2592000';
				}else {
					// default image
					return 'https://y.gtimg.cn/mediastyle/mobile/app/share/img/music_logo.png?max_age=2592000&v=30cd379f7b9491439f2e8dcd6e1508b6';
				}
			}
		},
		watch: {
			playingState(state) {
				let audio = this.$refs.audio;
				if(state == 'pause') {
					audio.pause() //暂停
				}else {
					let stack = 0;
					function recursivePlay(){
						let playPromise = audio.play();
						if (playPromise) {
							playPromise.catch(e => {
								setTimeout(() => {
									++stack >= 30 ? (alert('音乐加载失败，请重试'), store.commit(NameSpace+ '/pause','pause')) : recursivePlay();
								},500)
							});
						}
					}
					this.$nextTick(recursivePlay);
				}
			},
			playingSongid() {
				let that = this;
				jsonp({
					url:`https://api.darlin.me/music/lyric/${this.playingSongid}/?callback=jsonp1`,
					jsonpCallback: 'jsonp1'
				},reponse => {
					let lyrics = utf8.decode(base64.decode(response.lyric));
					self.lyricsObj = lyricsAnalysis(lyrics);
					self.switchLyricsArr(self.lyricsObj.lyricsArr);
				})
			},

			currentTime(time) {
				let	timeArr = this.lyricsObj.timeArr,
					lyricsArr = this.lyricsObj.lyricsArr,
					durationArr = this.lyricsObj.durationArr;

				timeArr.forEach((item, index) => {
					if (item == parseInt(time)) {
						this.currentLyric = lyricsArr[index];
						this.switchLyricIndex(index);
						this.switchLyricDuration(durationArr[index]);
					}
				});
			},
			pruneTime(time) {
				let audio = this.$refs.audio;
				audio.currentTime = time;
			}
		},
		methods: {
			...mapMutations(NameSpace,['pause','switchLyricIndex','switchLyricsArr','switchLyricDuration']),
			...mapMutations('list', ['toggleShow']),
			...mapActions(NameSpace, ['playSong']),
			_playProgress(e) {
				let audio = e.target,
					currentTime = audio.currentTime,
					duration = audio.duration;
				store.dispatch(NameSpace + '/resetProgress', {currentTime, duration});
			},
			swipeStart(e) {
				let touch = e.changedTouches[0];
				this.swipeObj.x = touch.clientX;
			},
			swipeMove(e) {
				this.swipeObj.move.x = e.changedTouches[0].clientX;
			},
			swipeEnd() {
				let touch = this.swipeObj.move,
					offsetX = touch.x > 0 ? touch.x - this.swipeObj.x : 0;

				if (Math.abs(offsetX) >= 60) {
					offsetX < 0 ? this.playSong('next') : this.playSong('prev');
				}
				// clear swipe obj
				this.swipeObj.start = this.swipeObj.move = {};
			}
		}
		
	}
</script>
<style lang='scss'>	
	.fixed-wrapper {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 3;
		overflow: hidden;
		.music-cell-song-fixed {
			.mint-cell-title {
				flex: 0;
			}
			.mint-cell-value {
				flex: 1;
				justify-content: space-between;
				.music-icon {
					width: 22px;
					height: 20px;
					margin-right: 20px;
					background-image: url(https://y.gtimg.cn/mediastyle/mobile/yqq_v5/img/search_sprite.png?max_age=19830212&d=20151105145423);
					background-repeat: no-repeat;
					-webkit-background-size: 22px 30px;
					background-size: 22px 30px;
				}
			}
		}
		.song-cover {
			display: flex;
			flex: 1;
			align-items: center;
			height: 56px;
			overflow: hidden;
			.name-desc {
				overflow: hidden;
				padding-left: 7px;
				font-size: 14px;
				p {
					white-space: nowrap;
					overflow: hidden;
					text-overflow:ellipsis;
				}
				p:first-child {
					font-size: 14px;
					color: #4A4A4A;
				}
				p:last-child {
					margin-top: 5px;
					color: #9B9B9B;
				}
			}
			.song-album-img {
				display: block;
				max-width: 100%;
				width: 45px;
				height: 45px;
				border-radius: 50%;
			}
		}
		.mint-cell-value {
			overflow: hidden;
		}
		.play-wrapper {
			display: flex;
			align-items: center;
			.circle-wrapper {
				position: relative;
			    width: 28px;
			    height: 28px;
			    border: 2px solid #31c27c;
			    border-radius: 50%;
				.progress-circle {
				    transform: rotate(-90deg);
				}
				.progress-circle-prog {
				    fill: none;
				    stroke: #31c27c;
				    stroke-width: 2px;
				    stroke-dasharray: 0, 70;
				    transition: stroke-dasharray 0.7s linear 0s;
				} 
				.play-icon {
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translate(-50%, -50%);
					width: 16px;
				}
			}
			.list-icon {
				margin-left: 16px;
				width: 24px;
				height: 24px;	
			}
		}
	}
</style>
