"""Unit tests for JPred timer engine."""
import pytest
import time
import json
from pathlib import Path
from unittest.mock import patch

from jpred.timer_engine import TimerEngine, TimerType, Session


class TestTimerEngine:
    """Tests for TimerEngine class."""
    
    @pytest.fixture
    def engine(self, tmp_path):
        """Create a fresh engine with temp storage."""
        data_path = tmp_path / "test_data.json"
        return TimerEngine(data_path=data_path)
    
    def test_initial_state(self, engine):
        """Test initial timer states."""
        for timer_type in TimerType:
            assert engine.get_total_time(timer_type) == 0.0
            assert not engine.is_running(timer_type)
    
    def test_start_timer(self, engine):
        """Test starting a timer."""
        engine.start_timer(TimerType.JOB_SEARCH)
        assert engine.is_running(TimerType.JOB_SEARCH)
    
    def test_stop_timer(self, engine):
        """Test stopping a timer."""
        engine.start_timer(TimerType.PRACTICE)
        time.sleep(0.1)
        session = engine.stop_timer(TimerType.PRACTICE)
        
        assert not engine.is_running(TimerType.PRACTICE)
        assert session is not None
        assert session.duration >= 0.1
        assert engine.get_total_time(TimerType.PRACTICE) >= 0.1
    
    def test_reset_timer(self, engine):
        """Test resetting a timer."""
        engine.start_timer(TimerType.UPSKILLING)
        time.sleep(0.1)
        engine.stop_timer(TimerType.UPSKILLING)
        
        initial_time = engine.get_total_time(TimerType.UPSKILLING)
        assert initial_time > 0
        
        engine.reset_timer(TimerType.UPSKILLING)
        assert engine.get_total_time(TimerType.UPSKILLING) == 0.0
    
    def test_elapsed_time_while_running(self, engine):
        """Test elapsed time calculation for running timer."""
        engine.start_timer(TimerType.JOB_SEARCH)
        time.sleep(0.2)
        
        elapsed = engine.get_elapsed_time(TimerType.JOB_SEARCH)
        assert elapsed >= 0.2
    
    def test_persistence(self, engine, tmp_path):
        """Test data persistence."""
        data_path = tmp_path / "test_data.json"
        
        # Start and stop a timer
        engine.start_timer(TimerType.JOB_SEARCH)
        time.sleep(0.1)
        engine.stop_timer(TimerType.JOB_SEARCH)
        
        # Create new engine with same path
        new_engine = TimerEngine(data_path=data_path)
        
        # Verify data persisted
        assert new_engine.get_total_time(TimerType.JOB_SEARCH) >= 0.1
        assert len(new_engine.get_all_sessions()[TimerType.JOB_SEARCH]) == 1
    
    def test_goals(self, engine):
        """Test goal setting and retrieval."""
        engine.set_goal(TimerType.JOB_SEARCH, 60)
        assert engine.get_goal(TimerType.JOB_SEARCH) == 60
        
        engine.set_goal(TimerType.PRACTICE, 90)
        assert engine.get_goal(TimerType.PRACTICE) == 90
    
    def test_progress_calculation(self, engine):
        """Test progress towards goals."""
        engine.set_goal(TimerType.JOB_SEARCH, 60)  # 60 minutes goal
        
        # 0% progress initially
        assert engine.get_progress(TimerType.JOB_SEARCH) == 0.0
        
        # Add 30 minutes (50% progress)
        with patch('time.time') as mock_time:
            mock_time.return_value = 1000
            engine.start_timer(TimerType.JOB_SEARCH)
            mock_time.return_value = 1000 + 1800  # 30 minutes later
            engine.stop_timer(TimerType.JOB_SEARCH)
        
        assert engine.get_progress(TimerType.JOB_SEARCH) == 0.5
    
    def test_session_history(self, engine):
        """Test session history tracking."""
        # Create multiple sessions
        for _ in range(3):
            engine.start_timer(TimerType.PRACTICE)
            time.sleep(0.05)
            engine.stop_timer(TimerType.PRACTICE)
        
        sessions = engine.get_all_sessions()[TimerType.PRACTICE]
        assert len(sessions) == 3


class TestSession:
    """Tests for Session dataclass."""
    
    def test_session_creation(self):
        """Test creating a session."""
        session = Session(
            start_time=1000.0,
            end_time=1100.0,
            duration=100.0
        )
        
        assert session.start_time == 1000.0
        assert session.end_time == 1100.0
        assert session.duration == 100.0
    
    def test_session_serialization(self):
        """Test session to_dict and from_dict."""
        original = Session(
            start_time=1000.0,
            end_time=1100.0,
            duration=100.0
        )
        
        data = original.to_dict()
        restored = Session.from_dict(data)
        
        assert restored.start_time == original.start_time
        assert restored.end_time == original.end_time
        assert restored.duration == original.duration


class TestTimerType:
    """Tests for TimerType enum."""
    
    def test_timer_types(self):
        """Test all timer types exist."""
        assert TimerType.JOB_SEARCH.value == "job_search"
        assert TimerType.PRACTICE.value == "practice"
        assert TimerType.UPSKILLING.value == "upskilling"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
