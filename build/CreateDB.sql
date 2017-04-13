CREATE TABLE `Game` (
 `id` int(11) NOT NULL,
 `name` varchar(100) CHARACTER SET utf8 NOT NULL,
 `release_date` varchar(20) DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `id` (`id`),
 KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `Queue` (
 `game_id` int(11) NOT NULL DEFAULT '0',
 `priority` int(11) NOT NULL DEFAULT '1',
 PRIMARY KEY (`game_id`),
 CONSTRAINT `Queue_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Game` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `Word` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `word` varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
 PRIMARY KEY (`id`),
 KEY `word` (`word`)
) ENGINE=InnoDB AUTO_INCREMENT=110072 DEFAULT CHARSET=latin1;

CREATE TABLE `GameWord` (
 `game_id` int(11) NOT NULL,
 `word_id` int(11) NOT NULL,
 `pos_score` float NOT NULL,
 `neg_score` float NOT NULL,
 KEY `game_id` (`game_id`),
 KEY `word_id` (`word_id`),
 CONSTRAINT `fk_gameWord_word_id` FOREIGN KEY (`word_id`) REFERENCES `Word` (`id`),
 CONSTRAINT `fk_gameWord_game_id` FOREIGN KEY (`game_id`) REFERENCES `Game` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `Feature` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `name` varchar(50) NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

CREATE TABLE `Recommendation` (
 `game_id` int(11) NOT NULL DEFAULT '0',
 `time_stamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `pos` int(11) DEFAULT NULL,
 `neg` int(11) DEFAULT NULL,
 PRIMARY KEY (`game_id`,`time_stamp`),
 CONSTRAINT `fk_rec_game_id` FOREIGN KEY (`game_id`) REFERENCES `Game` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `Quotes` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `game_id` int(11) NOT NULL,
 `sentence` varchar(500) DEFAULT NULL,
 `score` float DEFAULT NULL,
 PRIMARY KEY (`id`,`game_id`),
 KEY `game_id` (`game_id`),
 CONSTRAINT `Quotes_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Game` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=latin1;

CREATE TABLE `FeatureWord` (
 `feature_id` int(11) NOT NULL,
 `word_id` int(11) NOT NULL,
 PRIMARY KEY (`feature_id`,`word_id`),
 KEY `fk_featureWord_word_id` (`word_id`),
 CONSTRAINT `fk_featureWord_feat_id` FOREIGN KEY (`feature_id`) REFERENCES `Feature` (`id`),
 CONSTRAINT `fk_featureWord_word_id` FOREIGN KEY (`word_id`) REFERENCES `Word` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;